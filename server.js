const {EVChargeStation} = require('./database/data.js');
const {EVConnectors} = require('./database/data.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
app.use(bodyParser.json());
const {getURL, connect} = require('./connection.js');
require('dotenv').config();
const PORT = 3005;
app.use(bodyParser.json());
async function seturi() {
  const uri = process.env.uri || getURL();
  return uri;
}
const uri=seturi();
connect(uri)
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    });

app.post('/chargeStations', async (req, res, next) => {
  try {
    const chargeStationProduct = await EVChargeStation.create(req.body);
    res.status(200).json(chargeStationProduct);
  } catch (error) {
    res.status(400).json({Stationmessage: error.message});
  }
});


app.post('/connectors', async (req, res, next) => {
  try {
    const connectorProduct = await EVConnectors.create(req.body);
    res.status(200).json(connectorProduct);
  } catch (error) {
    res.status(400).json({Connectormessage: error.message});
  }
});


app.get('/connectors/:connectorId', async (req, res) => {
  const {soc, batteryCapacity} = req.body;
  const connectorId = req.params.connectorId;
  const connectorData = await EVConnectors.findOne({_id: connectorId});
  const estimationResponse = await axios.post('http://localhost:8080/estimate-charging-time', {
    batteryCapacity: parseFloat(batteryCapacity),
    stateOfCharge: parseFloat(soc),
    power: connectorData.wattage,
  });
  const responseData = {
    connectorType: connectorData.connectorType,
    isOnline: connectorData.isOnline,
    manufacturer: connectorData.manufacturer,
    estimateChargingTime: estimationResponse.data.estimateChargingTime,
  };
  res.status(200).json(responseData);
});

app.get('/connectors/existing/:connectorType', async (req, res, next) => {
  const connectorType = req.params.connectorType;
  const connectors = await EVConnectors.find({connectorType});

  if (connectors.length === 0) {
    res.status(400).json({message: 'No connectors found for the specified type'});
  } else {
    res.status(200).json(connectors);
  }
});

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

app.delete('/stations/:stationId', async (req, res) => {
  const {stationId} = req.params;
  const deletedStation = await EVChargeStation.findByIdAndDelete(stationId);
  if (!deletedStation) {
    return res.status(400).json({message: 'Station not found'});
  }
  return res.status(200).json({message: 'Station deleted successfully', deletedStation});
});
module.exports = {
  seturi,
  app,
};
