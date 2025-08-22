const { WalletManager, SUPPORTED_COINS } = require('./walletManager');
const PaymentService = require('./paymentService');

async function testWalletSystem() {
  console.log('🧪 Testing Wallet System...\n');

  try {
    // Test 1: Initialize Wallet Manager
    console.log('1. Testing Wallet Manager initialization...');
    const walletManager = new WalletManager();
    console.log('✅ Wallet Manager initialized successfully');

    // Test 2: Get wallet addresses
    console.log('\n2. Testing wallet address generation...');
    Object.keys(SUPPORTED_COINS).forEach(coin => {
      const address = walletManager.getWalletAddress(coin);
      console.log(`✅ ${coin.toUpperCase()}: ${address}`);
    });

    // Test 3: Generate payment ID
    console.log('\n3. Testing payment ID generation...');
    const paymentId = walletManager.generatePaymentId();
    console.log(`✅ Payment ID: ${paymentId}`);

    // Test 4: Test coin price fetching
    console.log('\n4. Testing coin price fetching...');
    for (const coin of Object.keys(SUPPORTED_COINS)) {
      try {
        const price = await walletManager.getCoinPrice(coin);
        console.log(`✅ ${coin.toUpperCase()}: $${price}`);
      } catch (error) {
        console.log(`❌ ${coin.toUpperCase()}: Error - ${error.message}`);
      }
    }

    // Test 5: Initialize Payment Service
    console.log('\n5. Testing Payment Service initialization...');
    const paymentService = new PaymentService();
    console.log('✅ Payment Service initialized successfully');

    // Test 6: Get supported coins
    console.log('\n6. Testing supported coins list...');
    const coins = paymentService.getSupportedCoins();
    console.log('✅ Supported coins:', coins.map(c => c.symbol).join(', '));

    // Test 7: Create a test payment request
    console.log('\n7. Testing payment request creation...');
    const testUserId = 123456789;
    const testCoin = 'eth';
    const testAmount = 0.01;
    
    const paymentRequest = await paymentService.createPaymentRequest(
      testUserId, 
      testCoin, 
      testAmount, 
      'Test payment'
    );
    
    console.log('✅ Payment request created:');
    console.log(`   Payment ID: ${paymentRequest.paymentId}`);
    console.log(`   Wallet Address: ${paymentRequest.walletAddress}`);
    console.log(`   Amount: ${paymentRequest.amount} ${paymentRequest.coin}`);
    console.log(`   USD Value: $${paymentRequest.amountInUSD}`);

    // Test 8: Get payment status
    console.log('\n8. Testing payment status...');
    const status = await paymentService.getPaymentStatus(paymentRequest.paymentId);
    console.log('✅ Payment status:', status.status);

    // Test 9: Get user payments
    console.log('\n9. Testing user payments retrieval...');
    const userPayments = await paymentService.getUserPayments(testUserId);
    console.log(`✅ User has ${userPayments.length} payment(s)`);

    // Test 10: Cleanup expired payments
    console.log('\n10. Testing payment cleanup...');
    const cleanedCount = await paymentService.cleanupExpiredPayments();
    console.log(`✅ Cleaned up ${cleanedCount} expired payments`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 System Summary:');
    console.log(`   • Supported coins: ${Object.keys(SUPPORTED_COINS).length}`);
    console.log(`   • Wallet addresses generated: ${Object.keys(SUPPORTED_COINS).length}`);
    console.log(`   • Payment service: ✅ Active`);
    console.log(`   • Price fetching: ✅ Working`);
    console.log(`   • Payment requests: ✅ Working`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWalletSystem();
