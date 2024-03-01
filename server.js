
const {EVChargeStation} = require('./database/model.js');
const {EVConnectors} = require('./database/model.js');
const express = require('express');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose'); // Import mongoose module
const app = express();
app.use(express.json());


// Route handler for creating charge stations
app.post('/chargeStationsPost', async (req, res, next) => {
    try {
        const chargeStationProduct = await EVChargeStation.create(req.body);
        res.status(200).json(chargeStationProduct);
    } catch (error) {
        res.status(500).json({Stationmessage: error.message});
    }
});


// Route handler for creating connectors
app.post('/connectorsPost', async (req, res, next) => {
  try {
    const connectorProduct = await EVConnectors.create(req.body);
    res.status(200).json(connectorProduct);
  } catch (error) {
      res.status(500).json({Connectormessage: error.message}); // Pass the error to the error handling middleware
  }
});

//Route handler for checking station exista for given type connector
app.get('/connectorsGet/:connectorType', async (req, res, next) => {
    const connectorType = req.params.connectorType;
    const connectors = await EVConnectors.find({connectorType});

    if (connectors.length === 0) {
        // Respond with status 404 if no connectors are found for the specified type
         res.status(404).json({message: 'No connectors found for the specified type'});
    } else {
        // Respond with status 200 and the found connectors
        res.status(200).json(connectors);
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


