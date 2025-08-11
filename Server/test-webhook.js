const axios = require('axios');

const WEBHOOK_URL = 'https://boostify-server.vercel.app/api/crypto-webhook';

// Sample webhook data for testing
const testWebhooks = [
  {
    name: "Bitcoin Deposit",
    data: {
      txid: "btc_tx_123456789",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      amount: 0.001,
      currency: "bitcoin",
      confirmations: 6,
      network: "bitcoin"
    }
  },
  {
    name: "Ethereum Deposit",
    data: {
      txid: "eth_tx_987654321",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      amount: 0.01,
      currency: "ethereum",
      confirmations: 12,
      network: "ethereum"
    }
  },
  {
    name: "Solana Deposit",
    data: {
      txid: "sol_tx_456789123",
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      amount: 0.1,
      currency: "solana",
      confirmations: 32,
      network: "solana"
    }
  },
  {
    name: "USDT ERC20 Deposit",
    data: {
      txid: "usdt_erc20_tx_789123456",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      amount: 50,
      currency: "tether",
      confirmations: 15,
      network: "ethereum"
    }
  },
  {
    name: "USDT SPL Deposit",
    data: {
      txid: "usdt_spl_tx_321654987",
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      amount: 25,
      currency: "tether",
      confirmations: 40,
      network: "solana"
    }
  }
];

async function testWebhook(webhookData) {
  try {
    console.log(`\n🧪 Testing: ${webhookData.name}`);
    console.log('Data:', JSON.stringify(webhookData.data, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, webhookData.data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting webhook tests...\n');
  
  for (const webhook of testWebhooks) {
    await testWebhook(webhook);
    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✨ All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
