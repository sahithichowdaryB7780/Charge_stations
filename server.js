const {EVChargeStation, EVConnectors} = require('./database/data.js');
const express = require('express');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose'); // Import mongoose module
const app = express();
app.use(express.json());

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500; // Use the provided status code or default to 500
  const message = err.message || 'Internal Server Error'; // Use the provided message or default message
  res.status(statusCode).json({ message }); // Send error response with status code and message
};

// Use the error handling middleware
app.use(errorHandler);

// Route handler for creating charge stations
app.post('/chargeStationsPost', async (req, res, next) => {
  try {
    const chargeStationProduct = await EVChargeStation.create(req.body);
    res.status(200).json(chargeStationProduct);
  } catch (error) {
    next({ status: 500, message: error.message || 'Internal Server Error' }); // Pass the error to the error handling middleware
  }
});

// Route handler for creating connectors
app.post('/connectorsPost', async (req, res, next) => {
  try {
    const connectorProduct = await EVConnectors.create(req.body);
    res.status(200).json(connectorProduct);
  } catch (error) {
    next({ status: 500, message: error.message || 'Internal Server Error' }); // Pass the error to the error handling middleware
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


