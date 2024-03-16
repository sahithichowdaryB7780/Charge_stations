const {EVChargeStation} = require('./database/data.js');
const {EVConnectors} = require('./database/data.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
require('dotenv').config();
app.use(bodyParser.json());
const {getURL, connect} = require('./connection.js');
let PORT = 3005;
app.use(bodyParser.json());
// Function to set URI
async function startServer() {
  const uri = await seturi();
  await connect(uri);
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  server.on('error', async (error) => {
    if (error.code === 'EADDRINUSE') {
      PORT++;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  });
}

async function seturi() {
  const uri = process.env.uri || getURL();
  return uri;
}

async function startingStartServer() {
  await startServer();
}
/* const uri = await seturi();
    connect(uri)
        .then(() => {
          app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
          });
        });
    async function seturi() {
        const uri = process.env.uri || getURL();
        return uri;*/


startingStartServer();

// Create Charge-Stations
app.post('/chargeStations', async (req, res, next) => {
  try {
    const chargeStationProduct = await EVChargeStation.create(req.body);
    res.status(200).json(chargeStationProduct);
  } catch (error) {
    res.status(400).json({Stationmessage: error.message});
  }
});

// Create Connectors
app.post('/connectors', async (req, res, next) => {
  try {
    const connectorProduct = await EVConnectors.create(req.body);
    res.status(200).json(connectorProduct);
  } catch (error) {
    res.status(400).json({Connectormessage: error.message});
  }
});

// Given Connector-Id must return estimation charging time
app.get('/connectors/chargingTime/:connectorId', async (req, res) => {
  const connectorId = req.params.connectorId;
  const connectorData = await EVConnectors.findById(connectorId);
  const {soc, battCapacity} = req.body;
  const estimationResponse = await axios.get('http://localhost:3000/estimate-charging-time', {
    params: {
      soc: soc,
      battcapacity: battCapacity,
      power: connectorData.wattage,
    },
  });
  const chargingTime = estimationResponse.data.estimationChargingTime;
  const responseData = {
    connectorType: connectorData.connectorType,
    isOnline: connectorData.isOnline,
    manufacturer: connectorData.manufacturer,
    estimateChargingTimeInHours: chargingTime,
  };
  res.status(200).json(responseData);
});

// It returns Connectors of specified Type
app.get('/connectors/existing/:connectorType', async (req, res, next) => {
  const connectorType = req.params.connectorType;
  const connectors = await EVConnectors.find({connectorType});

  if (connectors.length === 0) {
    res.status(400).json({message: 'No connectors found for the specified type'});
  } else {
    res.status(200).json(connectors);
  }
});

// It returns all stations near by containing specified Type Connectors
app.get('/connectors/:type/:longitude/:latitude', async (req, res) => {
  const {type, longitude, latitude} = req.params;

  const chargeStations = await EVChargeStation.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: 50000,
      },
    },
  });

  // Query for connectors of the specified type and associated with the found charge stations
  const connectors = await EVConnectors.find({
    'connectorType': type,
    'chargePoint.chargeStation': {$in: chargeStations._id},
  });

  res.status(200).json(connectors);
});

// Update the isonline Field
app.put('/connectors/:connectorId', async (req, res) => {
  const {connectorId} = req.params;
  const {isOnline} = req.body;

  const connector = await EVConnectors.findById(connectorId);
  if (!connector) {
    return res.status(400).json({message: 'Connector not found'});
  }
  connector.isOnline = isOnline;

  await connector.save();

  return res.status(200).json({message: 'Charge point updated successfully', connector});
});

// Delete the Station
app.delete('/stations/:stationId', async (req, res) => {
  const {stationId} = req.params;
  const deletedStation = await EVChargeStation.findByIdAndDelete(stationId);
  if (!deletedStation) {
    return res.status(400).json({message: 'Station not found'});
  }
  return res.status(200).json({message: 'Station deleted successfully', deletedStation});
});
module.exports = {
  app,
  startingStartServer,
};
