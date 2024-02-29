const {EVChargeStation, EVConnectors} = require('./database/data.js');
const express = require('express');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose'); // Import mongoose module
const app = express();
app.use(express.json());

app.post('/chargeStationsPost', async (req, res) => {
  try {
    const chargeStationProduct = await EVChargeStation.create(req.body);
    res.status(200).json(chargeStationProduct);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message});
  }
});

app.post('/connectorsPost', async (req, res) => {
  try {
    const connectorProduct = await EVConnectors.create(req.body);
    res.status(200).json(connectorProduct);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message});
  }
});

async function connect() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {});
}


// Call connect function to start the server and establish database connection
// connect().catch((error) => console.error(error));

module.exports = {app, connect};


