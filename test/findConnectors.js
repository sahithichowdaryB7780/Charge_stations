const {expect} = require('chai');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const request = require('supertest');
const {EVConnectors, EVChargeStation} = require('../database/data.js');
const {app, connect} = require('../server.js');
describe('Find Connectors of specified Type', () => {
  let mongoServerInFind;

  // Start MongoDB Memory Server and connect to it before running tests
  beforeEach(async () => {
    mongoServerInFind = await MongoMemoryServer.create();
    await connect(); // Establish database connection
  });

  it('should return connectors of the specified type and status 200 if successful', async () => {
    const stationDataInGet = {
      chargeStationName: 'AdEV',
      address: '1st cross, ISRO Layout, Bangalore',
      latitude: 53.34,
      longitude: 5.78,
      amenities: ['toilet'],
    };

    const responseStationInGet = await EVChargeStation.create(stationDataInGet);

    const _idofinsertedstationinget = responseStationInGet._id;

    await EVConnectors.create([
      {
        connector_id: 1,
        connectorType: 'Type A',
        wattage: 240,
        manufacturer: 'Manufacturer X',
        isOnline: true,
        chargePoint: {
          chargePointName: 'Hp1',
          chargeStation: _idofinsertedstationinget,
        },
      },
      {
        connector_id: 2,
        connectorType: 'Type B',
        wattage: 280,
        manufacturer: 'Manufacturer X',
        isOnline: true,
        chargePoint: {
          chargePointName: 'Hp1',
          chargeStation: _idofinsertedstationinget,
        },
      },
    ]);

    // Make request to retrieve connectors of the  type A
    const Getresponse = await request(app)
        .get('/connectors/existing/Type A')
        .expect(200);
    expect(Getresponse.body).to.be.an('array');
    expect(Getresponse.body).to.have.lengthOf(1);
  });

  // ----------------------------------------------------------//
  it('should return status 404 and an error message if no connectors are found for the specified type', async () => {
    // Specify a connector type for which no connectors exist
    const nonExistentConnectorType = 'Type-Y';

    // Make request to retrieve connectors for a nonexistent type
    const response = await request(app)
        .get(`/connectors/existing/${nonExistentConnectorType}`)
        .expect(404);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message', 'No connectors found for the specified type');
  });
  afterEach(async () => {
    await mongoose.disconnect(); // Disconnect from the database
    await mongoServerInFind.stop(); // Stop MongoDB Memory Server
  });
});
