const {expect} = require('chai');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const {app, connect} = require('../server.js');


describe('CRUD operations', () => {
  let mongoServer;

  // Start MongoDB Memory Server and connect to it before running tests
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connect(); // Establish database connection
  });


  // Stop MongoDB Memory Server after running tests
  afterEach(async () => {
    await mongoose.disconnect(); // Disconnect from the database
    await mongoServer.stop(); // Stop MongoDB Memory Server
  });


  it('should create a new station', async () => {
    const stationData = {
      chargeStationName: 'IndiEV',
      address: '11th cross, Kumarswamy Layout, Bangalore',
      latitude: 12.34,
      longitude: 56.78,
      amenities: ['restaurant', 'toilet'],
    };
    // Send POST request to /chargeStationsPost endpoint with stationData
    const response = await request(app)
        .post('/chargeStationsPost')
        .send(stationData)
        .expect(200);
    // Verify response body matches the data sent in the request
    expect(response.body.chargeStationName).to.equal(stationData.chargeStationName);
    expect(response.body.address).to.equal(stationData.address);
    expect(response.body.latitude).to.equal(stationData.latitude);
    expect(response.body.longitude).to.equal(stationData.longitude);
    expect(response.body.amenities).to.deep.equal(stationData.amenities);
  });

  // ----------------------------------------------------------//

  it('should return 500 when an error occurs', async () => {
    const stationData = {
      // Missing required fields, which should cause a validation error
      // This will trigger the catch block
    };

    await request(app)
        .post('/chargeStationsPost')
        .send(stationData)
        .expect(500);
  });

  // ----------------------------------------------------------//

  it('should create a new connector', async () => {
    const stationData = {
      chargeStationName: 'RelEV',
      address: '11th cross, ISRO Layout, Bangalore',
      latitude: 10.34,
      longitude: 54.78,
      amenities: ['restaurant', 'toilet'],
    };

    // Send POST request to create a charge station
    const responseStation = await request(app)
        .post('/chargeStationsPost')
        .send(stationData)

    const _idofinsertedstation = responseStation.body._id;

    const connector = {
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 240,
      manufacturer: 'Manufacturer X',
      chargePoint: [{
        chargePointName: 'Point A',
        isOnline: true,
        chargeStation: [_idofinsertedstation],
      }],
    };

    const response = await request(app)
        .post('/connectorsPost')
        .send(connector)
        .expect(200);

    expect(response.body.connector).to.have.property('connector_id').equal(connector.connector_id);
    expect(response.body.connector).to.have.property('connectorType').equal(connector.connectorType);
    expect(response.body.connector).to.have.property('wattage').equal(connector.wattage);
    expect(response.body.connector).to.have.property('manufacturer').equal(connector.manufacturer);
    expect(response.body.connector.chargePoint).to.be.an('array');
    expect(response.body.connector.chargePoint[0]).to.have.property('chargePointName').equal(connector.chargePoint[0].chargePointName);
    expect(response.body.connector.chargePoint[0]).to.have.property('isOnline').equal(connector.chargePoint[0].isOnline);
    expect(response.body.connector.chargePoint[0]).to.have.property('chargeStation').equal(connector.chargePoint[0].chargeStation);
  });
  // ----------------------------------------------------------//
  it('should return 500 when an error occurs in posting to connector', async () => {
    const connector = {
      // Missing required fields, which should cause a validation error
      // This will trigger the catch block
    };

 await request(app)
        .post('/connectorsPost')
        .send(connector)
        .expect(500);

    // Check if the response contains the error message
  });
});

