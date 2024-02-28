const {EVChargeStation} = require('./database/data.js');
const express = require('express');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose'); // Import mongoose module
const app = express();
app.use(express.json());

app.post('/chargeStationsPost', async (req, res) => {
  try {
    const product = await EVChargeStation.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message});
  }
});

async function connect() {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('db connected successfully');
  } catch (error) {
    console.log('Invalid Database Connection:', error);
  }
}


// Call connect function to start the server and establish database connection
// connect().catch((error) => console.error(error));

module.exports = {app, connect};


