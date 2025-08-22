import logging
import os
import secrets
from datetime import datetime
from pymongo import MongoClient
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# --- CONFIG ---
BOT_TOKEN = "8283793401:AAFn0T4qjXyT7v5QzsIRF-SUCBlXYe6I5CQ"
MONGO_URI = "mongodb+srv://Admin:vetrivel6@cluster0.jd3xg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "Boostify"
COLLECTION_NAME = "Users"

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

# --- MAIN BOT ---
if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("Bot is running...")
    app.run_polling()
