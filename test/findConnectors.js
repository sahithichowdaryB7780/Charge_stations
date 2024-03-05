const {expect} = require('chai');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const request = require('supertest');
const {EVConnectors} = require('../database/data.js');
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
  it('should return connectors of the specified type near the given coordinates', async () => {
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

    // Send GET request to the route and expect a 200 response
    await request(app)
        .get('/connectors/$Type A/close-to/50.71/49.06')
        .expect(200);
        .end((err, res) => {
        if (err) {
          return done(err); // Pass any errors to done()
        }


        done(); // Call done() to indicate that the test is complete
      });
  });
  afterEach(async () => {
    await mongoose.disconnect(); // Disconnect from the database
    await mongoServerInFind.stop(); // Stop MongoDB Memory Server
  });
});
