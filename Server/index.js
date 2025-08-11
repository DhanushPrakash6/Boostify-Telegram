const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Network, Alchemy } = require("alchemy-sdk");
const axios = require('axios');
const crypto = require('crypto');

const settings = {
  apiKey: "yv2uBTVdxcrjGhFHoLkX8r1DVBYYGCVW",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);
const app = express();
const port = process.env.PORT || 3000;

const TELEGRAM_BOT_USERNAME = "BoostifySocialBot"; 

const uri = "mongodb+srv://Admin:vetrivel6@cluster0.jd3xg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.use(cors({}));

let client;
let clientPromise;

if (!client) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

app.use(bodyParser.json());

function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

app.get('/', async (req, res) => {
  res.status(200).send("The server is running perfectly");
});

app.post('/api/insertUser', async (req, res) => {
  const { _id, name, coins, referralCode } = req.body;
  console.log('=== USER REGISTRATION DEBUG ===');
  console.log('Inserting user:', { _id, name, referralCode });
  
  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const collection = db.collection("Users");

    const existingUser = await collection.findOne({ _id: Number(_id) });

    if (existingUser) {
      console.log('✅ User already exists, checking referral...');
      console.log('Existing user data:', {
        _id: existingUser._id,
        name: existingUser.name,
        referralCode: existingUser.referralCode,
        referredBy: existingUser.referredBy,
        referredUsers: existingUser.referredUsers?.length || 0
      });

      if (!existingUser.referralCode) {
        let userReferralCode = generateReferralCode();
        while (await collection.findOne({ referralCode: userReferralCode })) {
          userReferralCode = generateReferralCode();
        }
        
        await collection.updateOne(
          { _id: Number(_id) },
          { 
            $set: { 
              referralCode: userReferralCode,
              referralEarnings: 0,
              referredUsers: []
            }
          }
        );
        console.log('✅ Generated referral code for existing user:', userReferralCode);
      }
      
      if (referralCode && !existingUser.referredBy) {
        console.log('🎯 Processing referral code:', referralCode);
        const referrer = await collection.findOne({ referralCode: referralCode });
        
        if (referrer && referrer._id !== Number(_id)) {
          console.log('✅ Found referrer:', referrer.name, 'ID:', referrer._id);
          
          const updateResult = await collection.updateOne(
            { _id: Number(_id) },
            { 
              $set: { 
                referredBy: referrer._id,
                referredByUsername: referrer.name
              }
            }
          );
          console.log('✅ Updated user referral status:', updateResult.modifiedCount > 0);
          
          const referrerUpdateResult = await collection.updateOne(
            { _id: referrer._id },
            { $push: { referredUsers: { userId: _id, username: name, joinedAt: new Date() } } }
          );
          console.log('✅ Updated referrer\'s referred users list:', referrerUpdateResult.modifiedCount > 0);
          
          console.log('🎉 Successfully linked user to referrer');
        } else {
          console.log('❌ Referrer not found or self-referral attempted');
          if (!referrer) {
            console.log('❌ No user found with referral code:', referralCode);
          }
          if (referrer && referrer._id === Number(_id)) {
            console.log('❌ User trying to refer themselves');
          }
        }
      } else {
        console.log('ℹ️ No referral code provided or user already referred');
        if (!referralCode) {
          console.log('ℹ️ No referral code provided');
        }
        if (existingUser.referredBy) {
          console.log('ℹ️ User already has a referrer:', existingUser.referredBy);
        }
      }
      
      console.log('=== END USER REGISTRATION DEBUG ===');
      return res.status(200).json({ message: "User already exists" });
    }

    let userReferralCode = generateReferralCode();
    while (await collection.findOne({ referralCode: userReferralCode })) {
      userReferralCode = generateReferralCode();
    }

    const userData = { 
      _id, 
      name, 
      coins, 
      referralCode: userReferralCode,
      referredBy: null,
      referralEarnings: 0,
      referredUsers: []
    };

    if (referralCode) {
      console.log('Processing referral for new user:', referralCode);
      const referrer = await collection.findOne({ referralCode: referralCode });
      
      if (referrer && referrer._id !== Number(_id)) {
        console.log('Found referrer for new user:', referrer.name, 'ID:', referrer._id);
        userData.referredBy = referrer._id;
        userData.referredByUsername = referrer.name;
        
        await collection.updateOne(
          { _id: referrer._id },
          { $push: { referredUsers: { userId: _id, username: name, joinedAt: new Date() } } }
        );
        console.log('Successfully linked new user to referrer');
      } else {
        console.log('Referrer not found for new user or self-referral attempted');
      }
    } else {
      console.log('No referral code provided for new user');
    }

    const result = await collection.insertOne(userData);
    console.log('New user created successfully:', result);
    res.status(200).json({ message: "User inserted successfully", result });
  } catch (error) {
    console.error("Error inserting user data:", error);
    res.status(500).json({ error: "Error inserting user data" });
  }
});

app.post('/api/subtractCoins', async (req, res) => {
  const { _id, amount } = req.query; 
  const metricsData = req.body;

  try {
    const connection = await clientPromise; 
    const db = connection.db("Boostify");
    const collection = db.collection("Users");
    const Data_collection = db.collection("Data")
    const user = await collection.findOne({ _id: Number(_id) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.coins < amount) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    const result = await collection.updateOne(
      { _id: Number(_id) },
      { $inc: { coins: -amount } } 
    );
    const push = await Data_collection.insertOne(metricsData);
    res.status(200).json({ message: "Successfully", result });
  } catch (error) {
    console.error("Error subtracting coins:", error);
    res.status(500).json({ error: "Error" });
  }
});

app.get('/api/getUserCoin', async (req, res) => {
  const _id = req.query.id; 

  if (!_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const collection = db.collection("Users");

    const user = await collection.findOne({ _id: Number(_id) });

    if (user) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ coins: user.coins });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Failed to fetch user coins:", error);
    res.status(500).json({ error: "Failed to fetch user coins", error});
  }
});

app.get('/api/getOrders', async (req, res) => {
  const _id = req.query.id; 

  if (!_id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const collection = db.collection("Data");

    const options = {
        projection: { social: 1, metrics: 1, amount: 1, postLink: 1 }
    };

    const query = { userId: Number(_id) };  

    const result = await collection.find(query, options).toArray();  

    if (result.length > 0) {  
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ result });
    } else {
        res.status(404).json({ message: "No orders found for this user" });
    }
  } catch (error) {
      console.error("Failed to fetch data:", error);
      res.status(500).json({ error: "Failed to fetch data", error });
  }

});
app.get('/api/txn', async (req, res) => {
  const userId = req.query.userId; 
  const txnHash = req.query.txnHash; 
  const toAddress = req.query.to; 
  const coin = req.query.coin;

  if (!txnHash || !toAddress || !userId) {
    return res.status(400).json({ error: 'Parameter Error' });
  }

  if (coin !== "USDT" && coin !== "ETH") {
    return res.status(400).json({ error: 'These Features will be available soon' });
  }

  try {
    const txnDetails = await alchemy.core.getTransaction(txnHash);

    if (!txnDetails) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (txnDetails.to.toLowerCase() !== toAddress.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid Transaction Hash' });
    }

    const valueInWei = txnDetails.value;
    const valueInETH = valueInWei / (10 ** 18); 
    const ethPriceInUSD = await getETHPriceInUSD();
    const valueInUSD = valueInETH * ethPriceInUSD;

    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const txnCollection = db.collection("Transactions");
    
    const existingTxn = await txnCollection.findOne({ txnHash: txnHash });

    if (existingTxn) {
      return res.status(400).json({ error: 'Invalid Transaction Hash' });
    }

    await txnCollection.insertOne({ txnHash: txnHash, userId: Number(userId), valueInUSD: valueInUSD, coin: coin });

    const usersCollection = db.collection("Users");
    const user = await usersCollection.findOne({ _id: Number(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedCoins = user.coins + valueInUSD;

    await usersCollection.updateOne(
      { _id: Number(userId) },
      { $set: { coins: updatedCoins } }
    );

    if (user.referredBy) {
      const referralBonus = valueInUSD * 0.01; 
      
      await usersCollection.updateOne(
        { _id: user.referredBy },
        { 
          $inc: { 
            coins: referralBonus,
            referralEarnings: referralBonus
          }
        }
      );
    }

    res.json({
      success: true,
      transactionHash: txnDetails.hash,
      from: txnDetails.from,
      to: txnDetails.to,
      valueInWei: valueInWei.toString(),
      valueInETH: valueInETH,
      valueInUSD: valueInUSD.toFixed(2), 
      gasPrice: txnDetails.gasPrice.toString(),
      gasLimit: txnDetails.gasLimit.toString(),
      blockNumber: txnDetails.blockNumber,
      ethPriceInUSD: ethPriceInUSD
    });
  } catch (error) {
    res.status(500).json({ error: 'Invalid Transaction Hash' });
  }
});

app.get('/api/getReferralInfo', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const collection = db.collection("Users");

    const user = await collection.findOne({ _id: Number(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.referralCode) {
      let userReferralCode = generateReferralCode();
      while (await collection.findOne({ referralCode: userReferralCode })) {
        userReferralCode = generateReferralCode();
      }
      
      await collection.updateOne(
        { _id: Number(userId) },
        { 
          $set: { 
            referralCode: userReferralCode,
            referralEarnings: user.referralEarnings || 0,
            referredUsers: user.referredUsers || []
          }
        }
      );
      
      const updatedUser = await collection.findOne({ _id: Number(userId) });
      const referralInfo = {
        referralCode: updatedUser.referralCode,
        referralLink: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=ref_${updatedUser.referralCode}`,
        referredUsers: updatedUser.referredUsers || [],
        referralEarnings: updatedUser.referralEarnings || 0,
        referredBy: updatedUser.referredBy ? {
          userId: updatedUser.referredBy,
          username: updatedUser.referredByUsername
        } : null
      };

      return res.status(200).json(referralInfo);
    }

    const referralInfo = {
      referralCode: user.referralCode,
      referralLink: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=ref_${user.referralCode}`,
      referredUsers: user.referredUsers || [],
      referralEarnings: user.referralEarnings || 0,
      referredBy: user.referredBy ? {
        userId: user.referredBy,
        username: user.referredByUsername
      } : null
    };

    res.status(200).json(referralInfo);
  } catch (error) {
    console.error("Error fetching referral info:", error);
    res.status(500).json({ error: "Error fetching referral info" });
  }
});

app.get('/api/testReferral', async (req, res) => {
  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const collection = db.collection("Users");

    const users = await collection.find({}, { 
      _id: 1, 
      name: 1, 
      referralCode: 1, 
      referredBy: 1, 
      referredUsers: 1,
      referralEarnings: 1 
    }).toArray();

    res.status(200).json({
      totalUsers: users.length,
      usersWithReferralCodes: users.filter(u => u.referralCode).length,
      usersWithReferrers: users.filter(u => u.referredBy).length,
      usersWithReferredUsers: users.filter(u => u.referredUsers && u.referredUsers.length > 0).length,
      users: users
    });
  } catch (error) {
    console.error("Error testing referral system:", error);
    res.status(500).json({ error: "Error testing referral system" });
  }
});

app.post('/api/testReferralLink', async (req, res) => {
  const { userId, referralCode } = req.body;
  
  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const collection = db.collection("Users");

    console.log('=== MANUAL REFERRAL TEST ===');
    console.log('Testing referral:', { userId, referralCode });

    const user = await collection.findOne({ _id: Number(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const referrer = await collection.findOne({ referralCode: referralCode });
    if (!referrer) {
      return res.status(404).json({ error: 'Referrer not found' });
    }

    console.log('User:', { id: user._id, name: user.name, referredBy: user.referredBy });
    console.log('Referrer:', { id: referrer._id, name: referrer.name, referralCode: referrer.referralCode });

    if (user.referredBy) {
      return res.status(400).json({ error: 'User already has a referrer' });
    }

    if (referrer._id === user._id) {
      return res.status(400).json({ error: 'User cannot refer themselves' });
    }

    await collection.updateOne(
      { _id: Number(userId) },
      { 
        $set: { 
          referredBy: referrer._id,
          referredByUsername: referrer.name
        }
      }
    );

    await collection.updateOne(
      { _id: referrer._id },
      { $push: { referredUsers: { userId: Number(userId), username: user.name, joinedAt: new Date() } } }
    );

    console.log('✅ Manual referral test successful');
    console.log('=== END MANUAL REFERRAL TEST ===');

    res.status(200).json({ 
      success: true, 
      message: 'Referral test successful',
      user: { id: user._id, name: user.name },
      referrer: { id: referrer._id, name: referrer.name }
    });
  } catch (error) {
    console.error("Error in manual referral test:", error);
    res.status(500).json({ error: "Error in manual referral test" });
  }
});


// NOWPayments webhook endpoint
app.post('/api/payment-webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('=== NOWPayments Webhook Received ===');
    console.log('Webhook data:', webhookData);

    const {
      payment_id,
      payment_status,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      order_id,
      order_description,
      outcome_amount,
      outcome_currency
    } = webhookData;

    // Verify the webhook signature (optional but recommended)
    // const signature = req.headers['x-nowpayments-sig'];
    // You can add signature verification here

    if (payment_status === 'confirmed' || payment_status === 'finished') {
      // Extract user ID from order_id (format: boostify_${userId}_${timestamp})
      const orderIdParts = order_id.split('_');
      if (orderIdParts.length >= 2) {
        const userId = parseInt(orderIdParts[1]);
        
        // Calculate coins to add (1 USD = 10 coins)
        const coinsToAdd = Math.floor(price_amount * 10);
        
        const connection = await clientPromise;
        const db = connection.db("Boostify");
        const collection = db.collection("Users");
        
        // Add coins to user account
        const updateResult = await collection.updateOne(
          { _id: userId },
          { $inc: { coins: coinsToAdd } }
        );

        if (updateResult.modifiedCount > 0) {
          // Log the successful payment
          const paymentLog = {
            payment_id,
            user_id: userId,
            payment_status,
            price_amount,
            price_currency,
            pay_amount,
            pay_currency,
            coins_added: coinsToAdd,
            order_id,
            order_description,
            outcome_amount,
            outcome_currency,
            timestamp: new Date(),
            webhook_received: true
          };

          const paymentsCollection = db.collection("Payments");
          await paymentsCollection.insertOne(paymentLog);

          console.log(`✅ Payment processed successfully for user ${userId}: ${coinsToAdd} coins added`);
        } else {
          console.log(`❌ User ${userId} not found for payment processing`);
        }
      } else {
        console.log('❌ Invalid order_id format:', order_id);
      }
    } else {
      console.log(`ℹ️ Payment ${payment_id} status: ${payment_status} - no action needed`);
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing NOWPayments webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment history for a user
app.get('/api/payment-history', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const paymentsCollection = db.collection("Payments");
    
    const payments = await paymentsCollection
      .find({ user_id: parseInt(userId) })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    
    res.status(200).json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

async function getETHPriceInUSD() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    throw new Error('Could not fetch ETH price');
  }
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
