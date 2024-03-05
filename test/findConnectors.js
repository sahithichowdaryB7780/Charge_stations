const {expect} = require('chai');
const {EVConnectors} = require('../database/data.js');
const mongooseInFind = require('mongoose');
const {app, connectInFind} = require('../server.js');
const {MongoMemoryServer} = require('mongodb-memory-server');
const request = require('supertest');

describe('Find Connectors of specified Type', () => {
  let mongoServerInFindConnectors;

  // Start MongoDB Memory Server and connect to it before running tests
  beforeEach(async () => {
    mongoServerInFindConnectors = await MongoMemoryServer.create();
    await connectInFind(); // Establish database connection
  });


  // Stop MongoDB Memory Server after running tests
  afterEach(async () => {
    // Disconnects from the database dj
    await mongooseInFind.disconnect(); // Disconnect from the database
    await mongoServerInFindConnectors.stop(); // Stop MongoDB Memory Server
  });
  it('should return connectors of the specified type and status 200 if successful', async () => {
    const stationDataInGet = {
      chargeStationName: 'AdEV',
      address: '1st cross, ISRO Layout, Bangalore',
      latitude: 53.34,
      longitude: 5.78,
      amenities: ['toilet'],
    };

    // Send POST request to create a charge station
    const responseStationInGet = await request(app)
        .post('/chargeStations')
        .send(stationDataInGet);

    const _idofinsertedstationinget = responseStationInGet.body._id;

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
        .get('/connectors/Type A')
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
        .get(`/connectors/${nonExistentConnectorType}`)
        .expect(404);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message', 'No connectors found for the specified type');
  });
});
