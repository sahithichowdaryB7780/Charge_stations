const {EVChargeStation, EVConnectors} = require('./database/data.js');
const express = require('express');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose'); // Import mongoose module
const app = express();
app.use(express.json());

// Define a middleware function for error handling
const errorHandler = (error, req, res, next) => {
  console.error(error.message); // Log the error message
  res.status(500).json({ message: 'Internal Server Error' }); // Send a generic error response
};

// Use the error handling middleware
app.use(errorHandler);

// Route handler for creating charge stations
app.post('/chargeStationsPost', async (req, res, next) => {
  try {
    const chargeStationProduct = await EVChargeStation.create(req.body);
    res.status(200).json(chargeStationProduct);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Route handler for creating connectors
app.post('/connectorsPost', async (req, res, next) => {
  try {
    const connectorProduct = await EVConnectors.create(req.body);
    res.status(200).json(connectorProduct);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
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


