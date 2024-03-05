const {EVChargeStation} = require('./database/data.js');
const {EVConnectors} = require('./database/data.js');
const express = require('express');
const bodyParser = require('body-parser');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.json());


app.post('/chargeStations', async (req, res, next) => {
  try {
    const chargeStationProduct = await EVChargeStation.create(req.body);
    res.status(200).json(chargeStationProduct);
  } catch (error) {
    res.status(500).json({Stationmessage: error.message});
  }
});


app.post('/connectors', async (req, res, next) => {
  try {
    const connectorProduct = await EVConnectors.create(req.body);
    res.status(200).json(connectorProduct);
  } catch (error) {
    res.status(500).json({Connectormessage: error.message}); // Pass the error to the error handling middleware
  }
});

app.get('/connectors/:connectorType', async (req, res, next) => {
  const connectorType = req.params.connectorType;
  const connectors = await EVConnectors.find({connectorType});

  if (connectors.length === 0) {
    res.status(404).json({message: 'No connectors found for the specified type'});
  } else {
    res.status(200).json(connectors);
  }
});

app.put('/connectors/:connectorId', async (req, res) => {
  try {
    const {connectorId} = req.params;
    const {isOnline} = req.body;

    const connector = await EVConnectors.findById(connectorId);
    if (!connector) {
      return res.status(404).json({message: 'Connector not found'});
    }
    connector.isOnline = isOnline;

    await connector.save();

    return res.status(200).json({message: 'Charge point updated successfully', connector});
  } catch (error) {
    return res.status(500).json({message: 'Some internal error caused'});
  }
});

app.delete('/stations/:stationId', async (req, res) => {
  try {
    const {stationId} = req.params;


    const deletedStation = await EVChargeStation.findByIdAndDelete(stationId);
    if (!deletedStation) {
      return res.status(404).json({message: 'Station not found'});
    }


    return res.status(200).json({message: 'Station deleted successfully', deletedStation});
  } catch (error) {
    return res.status(500).json({message: 'Some internal error caused in deleting'});
  }
});


async function connect() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {});
}

module.exports = {app, connect};


