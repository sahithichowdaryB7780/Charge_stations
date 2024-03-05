const {EVConnectors} = require('./database/data.js');
const express = require('express');
const app = express();
const request = require('supertest');
async function createStationsAndConnectors() {
  const stationDataForFindingStation1 = {
    chargeStationName: 'AtEV',
    address: '8th cross, ISRO Layout, Bangalore',
    latitude: 50.34,
    longitude: 50.78,
    amenities: ['toilet', 'restro'],
  };

  // Send POST request to create a charge station
  const responseStationForFindingStation1 = await request(app)
      .post('/connectors')
      .send(stationDataForFindingStation1);

  const _idofinsertedstationinForFindingStation1 = responseStationForFindingStation1.body._id;

  const stationDataForFindingStation2 = {
    chargeStationName: 'ArEV',
    address: '10th cross, ISRO Layout, Bangalore',
    latitude: 49.34,
    longitude: 49.78,
    amenities: ['toilet'],
  };

  // Send POST request to create a charge station
  const responseStationForFindingStation2 = await request(app)
      .post('/connectors')
      .send(stationDataForFindingStation2);

  const _idofinsertedstationinForFindingStation2 = responseStationForFindingStation2.body._id;

  await EVConnectors.create([
    {
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 340,
      manufacturer: 'Manufacturer O',
      isOnline: false,
      chargePoint: {
        chargePointName: 'Hp2',
        chargeStation: _idofinsertedstationinForFindingStation1,
      },
    },
    {
      connector_id: 13,
      connectorType: 'Type A',
      wattage: 640,
      manufacturer: 'Manufacturer L',
      isOnline: false,
      chargePoint: {
        chargePointName: 'Hi2',
        chargeStation: _idofinsertedstationinForFindingStation2,
      },
    },
  ]);
}
module.exports = {createStationsAndConnectors};
