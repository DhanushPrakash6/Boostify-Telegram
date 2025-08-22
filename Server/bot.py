import logging
import os
import secrets
import requests
from datetime import datetime
from pymongo import MongoClient
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters

# --- CONFIG ---
BOT_TOKEN = "8283793401:AAFn0T4qjXyT7v5QzsIRF-SUCBlXYe6I5CQ"
MONGO_URI = "mongodb+srv://Admin:vetrivel6@cluster0.jd3xg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "Boostify"
COLLECTION_NAME = "Users"
SERVER_URL = "https://boostify-server.vercel.app/"  # Update this to your server URL

# --- MONGODB CONNECTION ---
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db[COLLECTION_NAME]

# --- LOGGING ---
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# --- UTILITY FUNCTIONS ---
def generate_referral_code():
    return secrets.token_hex(4).upper()

def get_supported_coins():
    """Get list of supported coins from the server"""
    try:
        response = requests.get(f"{SERVER_URL}/api/payment/coins")
        if response.status_code == 200:
            return response.json()['coins']
        return []
    except Exception as e:
        logging.error(f"Error getting supported coins: {e}")
        return []

def create_payment_request(user_id, coin, amount, description=""):
    """Create a payment request"""
    try:
        response = requests.post(f"{SERVER_URL}/api/payment/create", json={
            'userId': user_id,
            'coin': coin,
            'amount': amount,
            'description': description
        })
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        logging.error(f"Error creating payment request: {e}")
        return None

def verify_payment(payment_id, tx_hash):
    """Verify a payment"""
    try:
        response = requests.post(f"{SERVER_URL}/api/payment/verify", json={
            'paymentId': payment_id,
            'txHash': tx_hash
        })
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        logging.error(f"Error verifying payment: {e}")
        return None

def get_payment_status(payment_id):
    """Get payment status"""
    try:
        response = requests.get(f"{SERVER_URL}/api/payment/status/{payment_id}")
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        logging.error(f"Error getting payment status: {e}")
        return None

async def register_user_with_referral(user_id, first_name, last_name, username, referral_code, context):
    try:
        full_name = first_name + (' ' + last_name if last_name else '')
        existing_user = users_collection.find_one({"_id": user_id})

        # If user already exists
        if existing_user:
            logging.info("User already exists: %s", existing_user)

            # Add referral code if missing
            if not existing_user.get("referralCode"):
                code = generate_referral_code()
                while users_collection.find_one({"referralCode": code}):
                    code = generate_referral_code()

                users_collection.update_one(
                    {"_id": user_id},
                    {"$set": {
                        "referralCode": code,
                        "referralEarnings": 0,
                        "referredUsers": []
                    }}
                )
                logging.info(f"Generated referral code for existing user: {code}")

            # If referral provided and not already referred
            if referral_code and not existing_user.get("referredBy"):
                referrer = users_collection.find_one({"referralCode": referral_code})
                if referrer and referrer["_id"] != user_id:
                    users_collection.update_one(
                        {"_id": user_id},
                        {"$set": {
                            "referredBy": referrer["_id"],
                            "referredByUsername": referrer["name"]
                        }}
                    )
                    users_collection.update_one(
                        {"_id": referrer["_id"]},
                        {"$push": {
                            "referredUsers": {
                                "userId": user_id,
                                "username": full_name,
                                "joinedAt": datetime.utcnow()
                            }
                        }}
                    )

                    await context.bot.send_message(user_id, f"🎉 Welcome to Boostify! You were referred by {referrer['name']}. You'll both earn rewards when you use our services!")
                    await context.bot.send_message(referrer["_id"], f"🎉 Great news! {full_name} just joined using your referral link! You'll earn 1% of their wallet recharges.")
                else:
                    logging.info("Invalid referral or self-referral attempt")
            return

        # New user
        code = generate_referral_code()
        while users_collection.find_one({"referralCode": code}):
            code = generate_referral_code()

        user_data = {
            "_id": user_id,
            "name": full_name,
            "coins": 0,
            "referralCode": code,
            "referredBy": None,
            "referralEarnings": 0,
            "referredUsers": []
        }

        if referral_code:
            referrer = users_collection.find_one({"referralCode": referral_code})
            if referrer and referrer["_id"] != user_id:
                user_data["referredBy"] = referrer["_id"]
                user_data["referredByUsername"] = referrer["name"]
                users_collection.update_one(
                    {"_id": referrer["_id"]},
                    {"$push": {
                        "referredUsers": {
                            "userId": user_id,
                            "username": full_name,
                            "joinedAt": datetime.utcnow()
                        }
                    }}
                )
                await context.bot.send_message(user_id, f"🎉 Welcome to Boostify! You were referred by {referrer['name']}. You'll both earn rewards when you use our services!")
                await context.bot.send_message(referrer["_id"], f"🎉 Great news! {full_name} just joined using your referral link! You'll earn 1% of their wallet recharges.")

        users_collection.insert_one(user_data)
        await context.bot.send_message(user_id, f"🎉 Welcome to Boostify! Your referral code is: {code}. Share it with friends to earn rewards!")

    except Exception as e:
        logging.error(f"Error registering user: {e}")

# --- COMMAND HANDLERS ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.message.from_user
    args = context.args
    referral_code = None

    if args and args[0].startswith("ref_"):
        referral_code = args[0][4:]  # Remove 'ref_' prefix

    await register_user_with_referral(
        user_id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        referral_code=referral_code,
        context=context
    )

    if not referral_code:
        await update.message.reply_text("Welcome to Boostify! 🚀\n\nUse our Mini App to boost your social media presence and earn rewards!")

async def deposit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /deposit command to show payment options"""
    user = update.message.from_user
    
    # Ensure user is registered
    existing_user = users_collection.find_one({"_id": user.id})
    if not existing_user:
        await update.message.reply_text("Please start the bot first with /start to register your account.")
        return

    coins = get_supported_coins()
    if not coins:
        await update.message.reply_text("❌ Sorry, payment service is currently unavailable. Please try again later.")
        return

    keyboard = []
    for coin in coins:
        keyboard.append([InlineKeyboardButton(
            f"{coin['symbol']} - {coin['name']}", 
            callback_data=f"pay_{coin['id']}"
        )])

    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "💳 **Deposit Funds**\n\n"
        "Choose your preferred cryptocurrency to deposit:\n\n"
        "💰 All deposits are automatically converted to USD and added to your balance.\n"
        "🎁 Referral bonus: 1% of deposits goes to your referrer!",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle payment selection callbacks"""
    query = update.callback_query
    await query.answer()

    if query.data.startswith("pay_"):
        coin_id = query.data[4:]  # Remove 'pay_' prefix
        context.user_data['selected_coin'] = coin_id
        
        await query.edit_message_text(
            f"💳 **{coin_id.upper()} Deposit**\n\n"
            f"Please enter the amount you want to deposit:\n\n"
            f"Example: `0.1` for {coin_id.upper()}\n"
            f"Minimum: `0.001` {coin_id.upper()}\n\n"
            f"Type your amount below:",
            parse_mode='Markdown'
        )
        context.user_data['waiting_for_amount'] = True

async def handle_amount_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle amount input for payment"""
    if not context.user_data.get('waiting_for_amount'):
        return

    try:
        amount = float(update.message.text)
        if amount < 0.001:
            await update.message.reply_text("❌ Amount too small. Minimum deposit is 0.001")
            return

        coin_id = context.user_data.get('selected_coin')
        if not coin_id:
            await update.message.reply_text("❌ No coin selected. Please use /deposit to start over.")
            return

        # Create payment request
        payment_request = create_payment_request(
            user_id=update.message.from_user.id,
            coin=coin_id,
            amount=amount,
            description=f"Deposit via Telegram bot"
        )

        if not payment_request:
            await update.message.reply_text("❌ Failed to create payment request. Please try again.")
            return

        # Clear waiting state
        context.user_data.pop('waiting_for_amount', None)
        context.user_data.pop('selected_coin', None)

        # Store payment ID for verification
        context.user_data['current_payment_id'] = payment_request['paymentId']

        await update.message.reply_text(
            f"💳 **Payment Request Created**\n\n"
            f"**Amount:** {payment_request['amount']} {payment_request['coin']}\n"
            f"**Value:** ${payment_request['amountInUSD']}\n"
            f"**Payment ID:** `{payment_request['paymentId']}`\n\n"
            f"**Send to this address:**\n"
            f"`{payment_request['walletAddress']}`\n\n"
            f"**Instructions:**\n"
            f"{payment_request['instructions']}\n\n"
            f"⏰ **Expires in 30 minutes**\n\n"
            f"After sending, use /verify <payment_id> <tx_hash> to verify your payment.",
            parse_mode='Markdown'
        )

    except ValueError:
        await update.message.reply_text("❌ Please enter a valid number (e.g., 0.1)")

async def verify_payment_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /verify command"""
    if not context.args or len(context.args) < 2:
        await update.message.reply_text(
            "❌ **Usage:** `/verify <payment_id> <transaction_hash>`\n\n"
            "Example: `/verify abc123 0x123...`",
            parse_mode='Markdown'
        )
        return

    payment_id = context.args[0]
    tx_hash = context.args[1]

    await update.message.reply_text("🔍 Verifying your payment... Please wait.")

    result = verify_payment(payment_id, tx_hash)
    
    if result and result.get('success'):
        await update.message.reply_text(
            f"✅ **Payment Verified Successfully!**\n\n"
            f"💰 **Amount:** ${result['amountInUSD']}\n"
            f"💳 **Added to your balance**\n"
            f"🎁 **Referral bonus sent to your referrer**\n\n"
            f"Your new balance: ${result['newBalance']:.2f}",
            parse_mode='Markdown'
        )
    else:
        await update.message.reply_text(
            "❌ **Payment verification failed!**\n\n"
            "Please check:\n"
            "• Payment ID is correct\n"
            "• Transaction hash is valid\n"
            "• Payment was sent to the correct address\n"
            "• Payment amount matches the request\n"
            "• Transaction is confirmed on the blockchain",
            parse_mode='Markdown'
        )

async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /balance command"""
    user = update.message.from_user
    
    existing_user = users_collection.find_one({"_id": user.id})
    if not existing_user:
        await update.message.reply_text("Please start the bot first with /start to register your account.")
        return

    await update.message.reply_text(
        f"💰 **Your Balance**\n\n"
        f"**Available:** ${existing_user.get('coins', 0):.2f}\n"
        f"**Referral Earnings:** ${existing_user.get('referralEarnings', 0):.2f}\n\n"
        f"Use /deposit to add more funds!",
        parse_mode='Markdown'
    )

# --- MAIN BOT ---
if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Add command handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("deposit", deposit))
    app.add_handler(CommandHandler("verify", verify_payment_command))
    app.add_handler(CommandHandler("balance", balance))
    
    # Add callback query handler for payment selection
    app.add_handler(CallbackQueryHandler(payment_callback))
    
    # Add message handler for amount input
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_amount_input))
    
    print("Bot is running...")
    app.run_polling()
