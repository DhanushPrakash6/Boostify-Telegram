const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

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
  const metricsData = req.body.metrics;

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
