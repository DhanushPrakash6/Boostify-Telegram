const crypto = require('crypto');
const axios = require('axios');
const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Admin:vetrivel6@cluster0.jd3xg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let client;
let clientPromise;

if (!client) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

class CryptoPaymentService {
  constructor() {
    // Supported cryptocurrencies with their configurations
    this.supportedCoins = {
      BTC: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
        network: 'bitcoin',
        apiEndpoint: 'https://api.blockcypher.com/v1/btc/main',
        priceApi: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      },
      ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        network: 'ethereum',
        apiEndpoint: 'https://api.blockcypher.com/v1/eth/main',
        priceApi: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      },
      USDT: {
        name: 'Tether',
        symbol: 'USDT',
        decimals: 6,
        network: 'ethereum',
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        priceApi: 'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd'
      },
      SOL: {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        network: 'solana',
        apiEndpoint: 'https://api.mainnet-beta.solana.com',
        priceApi: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      },
      BNB: {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18,
        network: 'binance',
        apiEndpoint: 'https://api.bscscan.com/api',
        priceApi: 'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd'
      }
    };

    // Master wallet addresses for each cryptocurrency
    this.masterWallets = {
      BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ETH: '0xee7911f4beaa561ae4f18ffccf52ed49342cb723',
      USDT: '0xee7911f4beaa561ae4f18ffccf52ed49342cb723',
      SOL: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      BNB: '0xee7911f4beaa561ae4f18ffccf52ed49342cb723'
    };
  }

  // Generate a unique deposit address for a user and amount
  async generateDepositAddress(userId, coin, amountUSD) {
    const coinConfig = this.supportedCoins[coin];
    if (!coinConfig) {
      throw new Error(`Unsupported cryptocurrency: ${coin}`);
    }

    // Generate a unique identifier for this deposit
    const depositId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();

    // Create deposit record
    const depositRecord = {
      depositId,
      userId: Number(userId),
      coin,
      amountUSD: Number(amountUSD),
      expectedAmount: await this.getExpectedCryptoAmount(coin, amountUSD),
      masterAddress: this.masterWallets[coin],
      status: 'pending',
      createdAt: new Date(timestamp),
      expiresAt: new Date(timestamp + 30 * 60 * 1000), // 30 minutes expiry
      confirmed: false
    };

    return {
      depositId,
      depositAddress: this.masterWallets[coin],
      qrCode: this.generateQRCode(this.masterWallets[coin]),
      expectedAmount: depositRecord.expectedAmount,
      coin,
      amountUSD,
      depositRecord
    };
  }

  // Get expected crypto amount based on current price
  async getExpectedCryptoAmount(coin, amountUSD) {
    try {
      const coinConfig = this.supportedCoins[coin];
      const response = await axios.get(coinConfig.priceApi);
      const priceUSD = response.data[coinConfig.symbol.toLowerCase()].usd;
      return (amountUSD / priceUSD).toFixed(coinConfig.decimals);
    } catch (error) {
      console.error(`Error fetching ${coin} price:`, error);
      // Return fallback values
      const fallbackPrices = {
        BTC: 63126.50,
        ETH: 2376.40,
        USDT: 1.00,
        SOL: 137.33,
        BNB: 563.84
      };
      return (amountUSD / fallbackPrices[coin]).toFixed(this.supportedCoins[coin].decimals);
    }
  }

  // Generate QR code data URL
  generateQRCode(address) {
    // For now, return a data URL that can be used to generate QR codes
    // In production, you might want to use a QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
  }

  // Check if a deposit has been received
  async checkDepositStatus(depositId, coin) {
    try {
      const coinConfig = this.supportedCoins[coin];
      const masterAddress = this.masterWallets[coin];

      // Get recent transactions for the master address
      const transactions = await this.getRecentTransactions(masterAddress, coin);
      
      // Check if any transaction matches the expected amount and time window
      const depositRecord = await this.getDepositRecord(depositId);
      if (!depositRecord) {
        return { status: 'not_found' };
      }

      const matchingTx = transactions.find(tx => {
        const txAmount = this.parseTransactionAmount(tx, coin);
        const expectedAmount = parseFloat(depositRecord.expectedAmount);
        const tolerance = expectedAmount * 0.01; // 1% tolerance
        
        return Math.abs(txAmount - expectedAmount) <= tolerance &&
               tx.timestamp >= depositRecord.createdAt.getTime() &&
               tx.timestamp <= depositRecord.expiresAt.getTime();
      });

      if (matchingTx) {
        return {
          status: 'confirmed',
          transaction: matchingTx,
          depositRecord
        };
      }

      return { status: 'pending' };
    } catch (error) {
      console.error('Error checking deposit status:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Get recent transactions for an address
  async getRecentTransactions(address, coin) {
    try {
      const coinConfig = this.supportedCoins[coin];
      
      switch (coin) {
        case 'BTC':
          return await this.getBitcoinTransactions(address);
        case 'ETH':
        case 'USDT':
          return await this.getEthereumTransactions(address, coin);
        case 'SOL':
          return await this.getSolanaTransactions(address);
        case 'BNB':
          return await this.getBinanceTransactions(address);
        default:
          throw new Error(`Unsupported coin: ${coin}`);
      }
    } catch (error) {
      console.error(`Error getting transactions for ${coin}:`, error);
      return [];
    }
  }

  // Get Bitcoin transactions
  async getBitcoinTransactions(address) {
    try {
      const response = await axios.get(`${this.supportedCoins.BTC.apiEndpoint}/addrs/${address}/full`);
      return response.data.txs.map(tx => ({
        hash: tx.hash,
        amount: tx.outputs.reduce((sum, output) => {
          if (output.addresses.includes(address)) {
            return sum + (output.value / 100000000); // Convert satoshis to BTC
          }
          return sum;
        }, 0),
        timestamp: tx.time * 1000,
        confirmations: tx.confirmations
      }));
    } catch (error) {
      console.error('Error getting Bitcoin transactions:', error);
      return [];
    }
  }

  // Get Ethereum transactions
  async getEthereumTransactions(address, coin) {
    try {
      const response = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=YourEtherscanAPIKey`);
      
      return response.data.result.map(tx => ({
        hash: tx.hash,
        amount: coin === 'USDT' ? 
          this.parseUSDTAmount(tx.input) : 
          (parseInt(tx.value) / Math.pow(10, 18)),
        timestamp: parseInt(tx.timeStamp) * 1000,
        confirmations: parseInt(tx.confirmations)
      }));
    } catch (error) {
      console.error('Error getting Ethereum transactions:', error);
      return [];
    }
  }

  // Parse USDT amount from transaction input
  parseUSDTAmount(input) {
    if (input.length < 138) return 0;
    
    const methodId = input.substring(0, 10);
    if (methodId !== '0xa9059cbb') return 0; // transfer method
    
    const amountHex = input.substring(74, 138);
    const amount = parseInt(amountHex, 16);
    return amount / Math.pow(10, 6); // USDT has 6 decimals
  }

  // Get Solana transactions
  async getSolanaTransactions(address) {
    try {
      const response = await axios.post(this.supportedCoins.SOL.apiEndpoint, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [address, { limit: 10 }]
      });
      
      return response.data.result.map(tx => ({
        hash: tx.signature,
        amount: 0, // Would need to parse transaction details
        timestamp: tx.blockTime * 1000,
        confirmations: tx.confirmationStatus === 'finalized' ? 1 : 0
      }));
    } catch (error) {
      console.error('Error getting Solana transactions:', error);
      return [];
    }
  }

  // Get Binance transactions
  async getBinanceTransactions(address) {
    try {
      const response = await axios.get(`https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=YourBscscanAPIKey`);
      
      return response.data.result.map(tx => ({
        hash: tx.hash,
        amount: parseInt(tx.value) / Math.pow(10, 18),
        timestamp: parseInt(tx.timeStamp) * 1000,
        confirmations: parseInt(tx.confirmations)
      }));
    } catch (error) {
      console.error('Error getting Binance transactions:', error);
      return [];
    }
  }

  // Parse transaction amount based on coin
  parseTransactionAmount(transaction, coin) {
    return transaction.amount || 0;
  }

  // Get deposit record from database
  async getDepositRecord(depositId) {
    try {
      const connection = await clientPromise;
      const db = connection.db("Boostify");
      const depositsCollection = db.collection("Deposits");
      return await depositsCollection.findOne({ depositId });
    } catch (error) {
      console.error('Error getting deposit record:', error);
      return null;
    }
  }

  // Get current prices for all supported coins
  async getCurrentPrices() {
    const prices = {};
    
    for (const [coin, config] of Object.entries(this.supportedCoins)) {
      try {
        const response = await axios.get(config.priceApi);
        prices[coin] = response.data[config.symbol.toLowerCase()].usd;
      } catch (error) {
        console.error(`Error fetching ${coin} price:`, error);
        // Use fallback prices
        const fallbackPrices = {
          BTC: 116468.50,
          ETH: 3897.41,
          USDT: 1.00,
          SOL: 174.58,
          BNB: 784.48
        };
        prices[coin] = fallbackPrices[coin];
      }
    }
    
    return prices;
  }

  // Get supported coins
  getSupportedCoins() {
    return Object.keys(this.supportedCoins).map(coin => ({
      symbol: coin,
      name: this.supportedCoins[coin].name,
      decimals: this.supportedCoins[coin].decimals
    }));
  }
}

module.exports = CryptoPaymentService;
