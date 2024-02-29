const {expect} = require('chai');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const {app, connect} = require('../server.js');

describe('POST /chargeStationsPost', () => {
  let mongoServer;

  // Start MongoDB Memory Server and connect to it before running tests
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connect(); // Establish database connection
  });

  // Stop MongoDB Memory Server after running tests
  after(async () => {
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
  it('should return 500 when an error occurs', async () => {
    const stationData = {
      // Missing required fields, which should cause a validation error
      // This will trigger the catch block
    };

    const response = await request(app)
        .post('/chargeStationsPost')
        .send(stationData)
        .expect(500);

    // Check if the response contains the error message
    expect(response.body).to.have.property('message').that.includes('validation failed');
  });
});
