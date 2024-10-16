const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Network, Alchemy } = require("alchemy-sdk");
const axios = require('axios');

const settings = {
  apiKey: "yv2uBTVdxcrjGhFHoLkX8r1DVBYYGCVW",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);
const app = express();
const port = process.env.PORT || 3000;

const uri = "mongodb+srv://Admin:vetrivel6@cluster0.jd3xg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.use(cors({}));

let client;
let clientPromise;

if (!client) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.status(200).send("The server is running perfectly");
});

app.post('/api/insertUser', async (req, res) => {
  const { _id, name, coins } = req.body;
  console.log(_id);
  
  try {
    const connection = await clientPromise;
    const db = connection.db("Boostify");
    const collection = db.collection("Users");

    const existingUser = await collection.findOne({ _id: Number(_id) });

    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }
    const result = await collection.insertOne({ _id, name, coins });
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
