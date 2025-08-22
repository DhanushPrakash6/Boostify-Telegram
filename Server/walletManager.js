const crypto = require('crypto');
const { ethers } = require('ethers');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const axios = require('axios');

// Supported coins configuration
const SUPPORTED_COINS = {
  'eth': {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    network: 'ethereum',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/yv2uBTVdxcrjGhFHoLkX8r1DVBYYGCVW'
  },
  'eth-usdt': {
    name: 'USDT on Ethereum',
    symbol: 'USDT',
    decimals: 6,
    network: 'ethereum',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/yv2uBTVdxcrjGhFHoLkX8r1DVBYYGCVW'
  },
  'sol': {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    network: 'solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com'
  },
  'sol-usdc': {
    name: 'USDC on Solana',
    symbol: 'USDC',
    decimals: 6,
    network: 'solana',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    rpcUrl: 'https://api.mainnet-beta.solana.com'
  },
  'btc': {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    network: 'bitcoin',
    rpcUrl: 'https://blockstream.info/api'
  }
};

class WalletManager {
  constructor() {
    this.ethereumProvider = new ethers.JsonRpcProvider(SUPPORTED_COINS.eth.rpcUrl);
    this.solanaConnection = new Connection(SUPPORTED_COINS.sol.rpcUrl);
    
    // Initialize wallets (in production, these should be stored securely)
    this.wallets = this.initializeWallets();
  }

  initializeWallets() {
    const wallets = {};
    
    // Generate wallets for each supported coin
    Object.keys(SUPPORTED_COINS).forEach(coin => {
      if (coin === 'btc') {
        // For Bitcoin, we'll use a simple address generation
        // In production, use a proper Bitcoin wallet library
        wallets[coin] = {
          address: this.generateBitcoinAddress(),
          privateKey: crypto.randomBytes(32).toString('hex')
        };
      } else if (coin.startsWith('sol')) {
        // Generate Solana wallet
        const keypair = crypto.randomBytes(32);
        wallets[coin] = {
          address: this.generateSolanaAddress(keypair),
          privateKey: keypair.toString('hex')
        };
      } else {
        // Generate Ethereum wallet (for ETH and ETH-USDT)
        const wallet = ethers.Wallet.createRandom();
        wallets[coin] = {
          address: wallet.address,
          privateKey: wallet.privateKey
        };
      }
    });
    
    return wallets;
  }

  generateBitcoinAddress() {
    // Simplified Bitcoin address generation
    // In production, use a proper Bitcoin library like bitcoinjs-lib
    const publicKey = crypto.randomBytes(33);
    const hash = crypto.createHash('sha256').update(publicKey).digest();
    const ripemd160 = crypto.createHash('ripemd160').update(hash).digest();
    return `1${ripemd160.toString('hex').substring(0, 25)}`;
  }

  generateSolanaAddress(privateKey) {
    // Simplified Solana address generation
    // In production, use @solana/web3.js properly
    const publicKey = crypto.createHash('sha256').update(privateKey).digest();
    return publicKey.toString('hex').substring(0, 44);
  }

  generatePaymentId() {
    return crypto.randomBytes(16).toString('hex');
  }

  getWalletAddress(coin) {
    if (!SUPPORTED_COINS[coin]) {
      throw new Error(`Unsupported coin: ${coin}`);
    }
    return this.wallets[coin].address;
  }

  async verifyTransaction(coin, txHash, expectedAmount, paymentId) {
    if (!SUPPORTED_COINS[coin]) {
      throw new Error(`Unsupported coin: ${coin}`);
    }

    const walletAddress = this.getWalletAddress(coin);
    
    try {
      switch (coin) {
        case 'eth':
          return await this.verifyEthereumTransaction(txHash, walletAddress, expectedAmount);
        case 'eth-usdt':
          return await this.verifyUSDTTransaction(txHash, walletAddress, expectedAmount);
        case 'sol':
          return await this.verifySolanaTransaction(txHash, walletAddress, expectedAmount);
        case 'sol-usdc':
          return await this.verifySolanaUSDCTransaction(txHash, walletAddress, expectedAmount);
        case 'btc':
          return await this.verifyBitcoinTransaction(txHash, walletAddress, expectedAmount);
        default:
          throw new Error(`Verification not implemented for ${coin}`);
      }
    } catch (error) {
      console.error(`Error verifying ${coin} transaction:`, error);
      throw error;
    }
  }

  async verifyEthereumTransaction(txHash, walletAddress, expectedAmount) {
    const tx = await this.ethereumProvider.getTransaction(txHash);
    
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (tx.to?.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Transaction not sent to our wallet');
    }

    const amountInEth = ethers.formatEther(tx.value);
    const expectedAmountInEth = expectedAmount.toString();

    if (parseFloat(amountInEth) < parseFloat(expectedAmountInEth)) {
      throw new Error(`Insufficient amount. Expected: ${expectedAmountInEth} ETH, Received: ${amountInEth} ETH`);
    }

    const receipt = await this.ethereumProvider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction not confirmed');
    }

    return {
      success: true,
      amount: amountInEth,
      from: tx.from,
      to: tx.to,
      blockNumber: tx.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice.toString()
    };
  }

  async verifyUSDTTransaction(txHash, walletAddress, expectedAmount) {
    const tx = await this.ethereumProvider.getTransaction(txHash);
    
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (tx.to?.toLowerCase() !== SUPPORTED_COINS['eth-usdt'].contractAddress.toLowerCase()) {
      throw new Error('Transaction not sent to USDT contract');
    }

    // Parse USDT transfer data
    const usdtInterface = new ethers.Interface([
      'function transfer(address to, uint256 amount)'
    ]);

    let decodedData;
    try {
      decodedData = usdtInterface.parseTransaction({ data: tx.data });
    } catch (error) {
      throw new Error('Invalid USDT transfer data');
    }

    if (decodedData.name !== 'transfer') {
      throw new Error('Not a USDT transfer');
    }

    const recipient = decodedData.args[0];
    const amount = decodedData.args[1];

    if (recipient.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('USDT not sent to our wallet');
    }

    const amountInUSDT = ethers.formatUnits(amount, 6);
    const expectedAmountInUSDT = expectedAmount.toString();

    if (parseFloat(amountInUSDT) < parseFloat(expectedAmountInUSDT)) {
      throw new Error(`Insufficient amount. Expected: ${expectedAmountInUSDT} USDT, Received: ${amountInUSDT} USDT`);
    }

    const receipt = await this.ethereumProvider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction not confirmed');
    }

    return {
      success: true,
      amount: amountInUSDT,
      from: tx.from,
      to: recipient,
      blockNumber: tx.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice.toString()
    };
  }

  async verifySolanaTransaction(txHash, walletAddress, expectedAmount) {
    const tx = await this.solanaConnection.getTransaction(txHash);
    
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (!tx.meta || tx.meta.err) {
      throw new Error('Transaction failed');
    }

    // Check if our wallet received SOL
    const postBalances = tx.meta.postBalances;
    const preBalances = tx.meta.preBalances;
    const accountIndex = tx.transaction.message.accountKeys.findIndex(
      key => key.toString() === walletAddress
    );

    if (accountIndex === -1) {
      throw new Error('Our wallet not involved in transaction');
    }

    const balanceChange = (postBalances[accountIndex] - preBalances[accountIndex]) / LAMPORTS_PER_SOL;
    
    if (balanceChange < parseFloat(expectedAmount)) {
      throw new Error(`Insufficient amount. Expected: ${expectedAmount} SOL, Received: ${balanceChange} SOL`);
    }

    return {
      success: true,
      amount: balanceChange.toString(),
      from: tx.transaction.message.accountKeys[0].toString(),
      to: walletAddress,
      blockTime: tx.blockTime,
      slot: tx.slot
    };
  }

  async verifySolanaUSDCTransaction(txHash, walletAddress, expectedAmount) {
    const tx = await this.solanaConnection.getTransaction(txHash);
    
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (!tx.meta || tx.meta.err) {
      throw new Error('Transaction failed');
    }

    // Check for USDC token transfer to our wallet
    const usdcMint = SUPPORTED_COINS['sol-usdc'].mintAddress;
    let usdcTransfer = null;

    for (const instruction of tx.meta.innerInstructions || []) {
      for (const inner of instruction.instructions) {
        if (inner.parsed && inner.parsed.type === 'transfer' && inner.parsed.info.mint === usdcMint) {
          if (inner.parsed.info.destination === walletAddress) {
            usdcTransfer = inner.parsed.info;
            break;
          }
        }
      }
      if (usdcTransfer) break;
    }

    if (!usdcTransfer) {
      throw new Error('USDC not transferred to our wallet');
    }

    const amountInUSDC = parseFloat(usdcTransfer.amount) / Math.pow(10, 6);
    
    if (amountInUSDC < parseFloat(expectedAmount)) {
      throw new Error(`Insufficient amount. Expected: ${expectedAmount} USDC, Received: ${amountInUSDC} USDC`);
    }

    return {
      success: true,
      amount: amountInUSDC.toString(),
      from: tx.transaction.message.accountKeys[0].toString(),
      to: walletAddress,
      blockTime: tx.blockTime,
      slot: tx.slot
    };
  }

  async verifyBitcoinTransaction(txHash, walletAddress, expectedAmount) {
    try {
      // Use Blockstream API to verify Bitcoin transaction
      const response = await axios.get(`${SUPPORTED_COINS.btc.rpcUrl}/tx/${txHash}`);
      const tx = response.data;

      if (!tx) {
        throw new Error('Transaction not found');
      }

      // Check if our wallet received BTC
      let receivedAmount = 0;
      for (const output of tx.vout) {
        if (output.scriptpubkey_address === walletAddress) {
          receivedAmount += output.value / 100000000; // Convert satoshis to BTC
        }
      }

      if (receivedAmount < parseFloat(expectedAmount)) {
        throw new Error(`Insufficient amount. Expected: ${expectedAmount} BTC, Received: ${receivedAmount} BTC`);
      }

      return {
        success: true,
        amount: receivedAmount.toString(),
        from: tx.vin[0]?.prevout?.scriptpubkey_address || 'Unknown',
        to: walletAddress,
        blockHeight: tx.status.block_height,
        blockTime: tx.status.block_time
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Transaction not found');
      }
      throw error;
    }
  }

  async getCoinPrice(coin) {
    try {
      const coinId = this.getCoinGeckoId(coin);
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
      return response.data[coinId].usd;
    } catch (error) {
      console.error(`Error fetching ${coin} price:`, error);
      throw new Error(`Could not fetch ${coin} price`);
    }
  }

  getCoinGeckoId(coin) {
    const coinMap = {
      'eth': 'ethereum',
      'eth-usdt': 'tether',
      'sol': 'solana',
      'sol-usdc': 'usd-coin',
      'btc': 'bitcoin'
    };
    return coinMap[coin];
  }
}

module.exports = { WalletManager, SUPPORTED_COINS };
