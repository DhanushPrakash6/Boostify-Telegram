# Multi-Coin Payment System

This document describes the implementation of a multi-cryptocurrency payment system for the Boostify Telegram bot.

## 🚀 Features

- **Multi-Coin Support**: ETH, ETH-USDT, SOL, SOL-USDC, BTC
- **Unique Payment IDs**: Each payment gets a unique identifier
- **Automatic Verification**: Blockchain transaction verification
- **USD Conversion**: All payments converted to USD for consistent pricing
- **Referral Integration**: 1% referral bonus on all deposits
- **Telegram Bot Integration**: Seamless payment flow through bot commands

## 📁 File Structure

```
Server/
├── walletManager.js          # Core wallet management and verification
├── paymentService.js         # Payment request and status management
├── index.js                  # Express server with payment endpoints
├── bot.py                    # Telegram bot with payment commands
├── test_wallet.js           # Test script for the wallet system
└── PAYMENT_SYSTEM_README.md  # This documentation
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install ethers@^6.11.1 @solana/web3.js@^1.91.0
```

2. Update your server URL in `bot.py`:
```python
SERVER_URL = "http://your-server-url:3000"
```

## 🔧 Configuration

### Supported Coins

The system supports the following cryptocurrencies:

| Coin ID | Name | Symbol | Network | Contract/Mint Address |
|---------|------|--------|---------|----------------------|
| `eth` | Ethereum | ETH | Ethereum Mainnet | - |
| `eth-usdt` | USDT on Ethereum | USDT | Ethereum Mainnet | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| `sol` | Solana | SOL | Solana Mainnet | - |
| `sol-usdc` | USDC on Solana | USDC | Solana Mainnet | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `btc` | Bitcoin | BTC | Bitcoin Mainnet | - |

### Wallet Management

- Each coin has its own dedicated wallet address
- Wallets are generated on system startup
- In production, store private keys securely (hardware wallets recommended)

## 📡 API Endpoints

### Get Supported Coins
```
GET /api/payment/coins
```
Returns list of supported cryptocurrencies.

### Get Coin Price
```
GET /api/payment/price/:coin
```
Returns current USD price for a specific coin.

### Create Payment Request
```
POST /api/payment/create
Content-Type: application/json

{
  "userId": 123456789,
  "coin": "eth",
  "amount": 0.1,
  "description": "Optional description"
}
```

### Verify Payment
```
POST /api/payment/verify
Content-Type: application/json

{
  "paymentId": "abc123...",
  "txHash": "0x123..."
}
```

### Get Payment Status
```
GET /api/payment/status/:paymentId
```

### Get User Payments
```
GET /api/payment/user/:userId
```

### Cleanup Expired Payments
```
POST /api/payment/cleanup
```

## 🤖 Telegram Bot Commands

### `/deposit`
Shows available cryptocurrencies for deposit with inline keyboard.

### `/verify <payment_id> <tx_hash>`
Verifies a payment after user sends the transaction.

### `/balance`
Shows user's current balance and referral earnings.

## 🔄 Payment Flow

1. **User initiates payment** (`/deposit`)
2. **Select cryptocurrency** (inline keyboard)
3. **Enter amount** (text input)
4. **System generates payment request** with:
   - Unique payment ID
   - Wallet address
   - Amount and USD value
   - 30-minute expiry
5. **User sends payment** to provided address
6. **User verifies payment** (`/verify <payment_id> <tx_hash>`)
7. **System verifies transaction**:
   - Checks transaction exists
   - Validates recipient address
   - Confirms amount ≥ expected
   - Verifies transaction is confirmed
8. **Credit user account** and handle referral bonus

## 🔍 Transaction Verification

### Ethereum (ETH)
- Verifies transaction recipient matches wallet address
- Checks ETH amount ≥ expected
- Confirms transaction status is successful

### USDT on Ethereum
- Verifies transaction is sent to USDT contract
- Decodes transfer function data
- Validates recipient and amount
- Confirms transaction status

### Solana (SOL)
- Checks SOL balance change for wallet
- Validates amount received ≥ expected
- Confirms transaction success

### USDC on Solana
- Searches for USDC token transfer instructions
- Validates recipient and amount
- Confirms transaction success

### Bitcoin
- Uses Blockstream API to verify transaction
- Checks outputs to wallet address
- Validates total amount received

## 💰 Referral System Integration

- 1% of all deposits goes to the user's referrer
- Referral bonus is automatically calculated and credited
- Works with existing referral system

## 🧪 Testing

Run the test script to verify system functionality:

```bash
node test_wallet.js
```

This will test:
- Wallet initialization
- Address generation
- Payment ID generation
- Price fetching
- Payment request creation
- Status checking
- User payment retrieval
- Cleanup functionality

## 🔒 Security Considerations

### Production Recommendations

1. **Secure Key Storage**: Use hardware wallets or secure key management
2. **Rate Limiting**: Implement API rate limiting
3. **Input Validation**: Validate all user inputs
4. **HTTPS**: Use HTTPS for all API communications
5. **Monitoring**: Monitor for suspicious transactions
6. **Backup**: Regular backup of payment data

### Current Implementation Notes

- Wallets are generated in memory (not persistent)
- Private keys are stored in plain text (for development only)
- No rate limiting implemented
- Basic input validation only

## 🚨 Error Handling

The system handles various error scenarios:

- Invalid coin selection
- Insufficient payment amounts
- Transaction not found
- Wrong recipient address
- Transaction not confirmed
- Expired payment requests
- Duplicate payment verification

## 📊 Monitoring

Key metrics to monitor:

- Payment success rate
- Average verification time
- Failed payment reasons
- Coin usage distribution
- Referral bonus distribution

## 🔄 Future Enhancements

### Optional Upgrades

1. **Memo/Reference Tags**: Use blockchain memo fields instead of payment IDs
2. **Automatic Verification**: Poll for payments instead of manual verification
3. **Payment Notifications**: Send notifications when payments are received
4. **Multi-Signature Wallets**: Enhanced security for large amounts
5. **Payment Limits**: Implement minimum/maximum payment limits
6. **Analytics Dashboard**: Web interface for payment analytics

### Blockchain-Specific Memo Support

#### Solana
- Use memo field in transaction for payment ID
- More user-friendly than manual entry

#### Bitcoin
- Use OP_RETURN for payment ID storage
- Requires specialized wallet support

#### Ethereum
- Use transaction data field for payment ID
- Requires custom contract or data encoding

## 🆘 Troubleshooting

### Common Issues

1. **Payment verification fails**
   - Check transaction hash format
   - Ensure payment was sent to correct address
   - Verify transaction is confirmed (not pending)

2. **Price fetching errors**
   - Check CoinGecko API status
   - Verify network connectivity
   - Check rate limits

3. **Wallet generation fails**
   - Check dependencies installation
   - Verify RPC endpoint availability
   - Check for sufficient system resources

### Debug Commands

```bash
# Test wallet system
node test_wallet.js

# Check server logs
tail -f server.log

# Test API endpoints
curl http://localhost:3000/api/payment/coins
```

## 📞 Support

For issues or questions about the payment system:

1. Check this documentation
2. Run the test script
3. Review server logs
4. Check API endpoint responses
5. Verify blockchain transaction status

---

**Note**: This system is designed for development and testing. For production use, implement proper security measures and use secure key management solutions.
