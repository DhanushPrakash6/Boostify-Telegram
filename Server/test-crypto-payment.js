const axios = require('axios');

const BASE_URL = 'https://boostify-server.vercel.app';

async function testCryptoPayment() {
  console.log('🧪 Testing Crypto Payment System...\n');

  try {
    // Test 1: Create a crypto payment
    console.log('1. Testing payment creation...');
    const createResponse = await axios.post(`${BASE_URL}/api/createCryptoCharge`, {
      userId: 1011111,
      amount: 10,
      network: 'ethereum'
    });

    if (createResponse.data.success) {
      console.log('✅ Payment created successfully');
      console.log(`   Charge ID: ${createResponse.data.chargeId}`);
      console.log(`   Payment Address: ${createResponse.data.paymentAddress}`);
      console.log(`   Amount: $${createResponse.data.amount}`);
      console.log(`   Required ETH: ${createResponse.data.requiredAmounts.ethereum}`);
      
      const chargeId = createResponse.data.chargeId;

      // Test 2: Get payment status
      console.log('\n2. Testing payment status retrieval...');
      const statusResponse = await axios.get(`${BASE_URL}/api/getCryptoCharge/${chargeId}`);
      
      if (statusResponse.data.success) {
        console.log('✅ Payment status retrieved successfully');
        console.log(`   Status: ${statusResponse.data.charge.status}`);
        console.log(`   Created: ${statusResponse.data.charge.createdAt}`);
      }

      // Test 3: Get user payment history
      console.log('\n3. Testing user payment history...');
      const historyResponse = await axios.get(`${BASE_URL}/api/getUserCryptoCharges/1011111`);
      
      if (historyResponse.data.success) {
        console.log('✅ User payment history retrieved successfully');
        console.log(`   Total charges: ${historyResponse.data.charges.length}`);
      }

    } else {
      console.log('❌ Payment creation failed');
    }

    // Test 4: Get user balance
    console.log('\n4. Testing user balance retrieval...');
    const balanceResponse = await axios.get(`${BASE_URL}/api/getUserCoin?id=1011111`);
    
    if (balanceResponse.data.coins !== undefined) {
      console.log('✅ User balance retrieved successfully');
      console.log(`   Current balance: $${balanceResponse.data.coins}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Crypto payment system test completed!');
}

// Run the test
testCryptoPayment();
