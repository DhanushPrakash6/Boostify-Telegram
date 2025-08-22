const { WalletManager, SUPPORTED_COINS } = require('./walletManager');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.walletManager = new WalletManager();
    this.pendingPayments = new Map(); // Store pending payments in memory (use Redis in production)
  }

  async createPaymentRequest(userId, coin, amount, description = '') {
    if (!SUPPORTED_COINS[coin]) {
      throw new Error(`Unsupported coin: ${coin}`);
    }

    const paymentId = this.walletManager.generatePaymentId();
    const walletAddress = this.walletManager.getWalletAddress(coin);
    
    // Get current coin price for USD conversion
    const coinPrice = await this.walletManager.getCoinPrice(coin);
    const amountInUSD = parseFloat(amount) * coinPrice;

    const paymentRequest = {
      paymentId,
      userId: Number(userId),
      coin,
      amount: parseFloat(amount),
      amountInUSD,
      walletAddress,
      description,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      verified: false
    };

    // Store payment request
    this.pendingPayments.set(paymentId, paymentRequest);

    return {
      paymentId,
      walletAddress,
      amount,
      coin: SUPPORTED_COINS[coin].symbol,
      coinName: SUPPORTED_COINS[coin].name,
      amountInUSD: amountInUSD.toFixed(2),
      expiresAt: paymentRequest.expiresAt,
      instructions: this.getPaymentInstructions(coin, walletAddress, amount, paymentId)
    };
  }

  getPaymentInstructions(coin, walletAddress, amount, paymentId) {
    const coinInfo = SUPPORTED_COINS[coin];
    
    switch (coin) {
      case 'eth':
        return `Send exactly ${amount} ETH to:\n${walletAddress}\n\nNetwork: Ethereum Mainnet\nPayment ID: ${paymentId}`;
      
      case 'eth-usdt':
        return `Send exactly ${amount} USDT to:\n${walletAddress}\n\nNetwork: Ethereum Mainnet (ERC-20)\nPayment ID: ${paymentId}`;
      
      case 'sol':
        return `Send exactly ${amount} SOL to:\n${walletAddress}\n\nNetwork: Solana Mainnet\nPayment ID: ${paymentId}`;
      
      case 'sol-usdc':
        return `Send exactly ${amount} USDC to:\n${walletAddress}\n\nNetwork: Solana Mainnet (SPL Token)\nPayment ID: ${paymentId}`;
      
      case 'btc':
        return `Send exactly ${amount} BTC to:\n${walletAddress}\n\nNetwork: Bitcoin Mainnet\nPayment ID: ${paymentId}`;
      
      default:
        return `Send exactly ${amount} ${coinInfo.symbol} to:\n${walletAddress}\n\nPayment ID: ${paymentId}`;
    }
  }

  async verifyPayment(paymentId, txHash) {
    const paymentRequest = this.pendingPayments.get(paymentId);
    
    if (!paymentRequest) {
      throw new Error('Payment request not found or expired');
    }

    if (paymentRequest.verified) {
      throw new Error('Payment already verified');
    }

    if (new Date() > paymentRequest.expiresAt) {
      this.pendingPayments.delete(paymentId);
      throw new Error('Payment request expired');
    }

    try {
      // Verify the transaction
      const verificationResult = await this.walletManager.verifyTransaction(
        paymentRequest.coin,
        txHash,
        paymentRequest.amount,
        paymentId
      );

      if (verificationResult.success) {
        // Mark payment as verified
        paymentRequest.verified = true;
        paymentRequest.verifiedAt = new Date();
        paymentRequest.txHash = txHash;
        paymentRequest.verificationResult = verificationResult;

        return {
          success: true,
          paymentId,
          amount: verificationResult.amount,
          amountInUSD: paymentRequest.amountInUSD,
          coin: SUPPORTED_COINS[paymentRequest.coin].symbol,
          txHash,
          userId: paymentRequest.userId
        };
      } else {
        throw new Error('Transaction verification failed');
      }
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId) {
    const paymentRequest = this.pendingPayments.get(paymentId);
    
    if (!paymentRequest) {
      return { status: 'not_found' };
    }

    return {
      paymentId,
      status: paymentRequest.verified ? 'verified' : 'pending',
      amount: paymentRequest.amount,
      coin: SUPPORTED_COINS[paymentRequest.coin].symbol,
      amountInUSD: paymentRequest.amountInUSD,
      createdAt: paymentRequest.createdAt,
      expiresAt: paymentRequest.expiresAt,
      verified: paymentRequest.verified,
      verifiedAt: paymentRequest.verifiedAt,
      txHash: paymentRequest.txHash
    };
  }

  async getUserPayments(userId) {
    const userPayments = [];
    
    for (const [paymentId, payment] of this.pendingPayments.entries()) {
      if (payment.userId === Number(userId)) {
        userPayments.push({
          paymentId,
          coin: SUPPORTED_COINS[payment.coin].symbol,
          amount: payment.amount,
          amountInUSD: payment.amountInUSD,
          status: payment.verified ? 'verified' : 'pending',
          createdAt: payment.createdAt,
          verifiedAt: payment.verifiedAt,
          txHash: payment.txHash
        });
      }
    }

    return userPayments.sort((a, b) => b.createdAt - a.createdAt);
  }

  async cleanupExpiredPayments() {
    const now = new Date();
    const expiredPayments = [];

    for (const [paymentId, payment] of this.pendingPayments.entries()) {
      if (now > payment.expiresAt && !payment.verified) {
        expiredPayments.push(paymentId);
      }
    }

    expiredPayments.forEach(paymentId => {
      this.pendingPayments.delete(paymentId);
    });

    return expiredPayments.length;
  }

  getSupportedCoins() {
    return Object.keys(SUPPORTED_COINS).map(coin => ({
      id: coin,
      name: SUPPORTED_COINS[coin].name,
      symbol: SUPPORTED_COINS[coin].symbol,
      decimals: SUPPORTED_COINS[coin].decimals,
      network: SUPPORTED_COINS[coin].network
    }));
  }

  async getCoinPrice(coin) {
    return await this.walletManager.getCoinPrice(coin);
  }

  async getWalletAddress(coin) {
    return this.walletManager.getWalletAddress(coin);
  }
}

module.exports = PaymentService;
