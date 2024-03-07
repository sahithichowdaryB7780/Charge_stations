const {expect} = require('chai');
const {MongoMemoryServer} = require('mongodb-memory-server');
const request = require('supertest');
const {app, connect} = require('../server.js');
const mongoose = require('mongoose');
const {EVConnectors} = require('../database/data.js');

describe('Update isOnline Field in Connectors', () => {
  let mongoServerInUpdate;

  // Start MongoDB Memory Server and connect to it before running tests
  beforeEach(async () => {
    mongoServerInUpdate = await MongoMemoryServer.create();
    await connect(); // Establish database connection
  });


  it('should update the isOnline field when the connector exists', async () => {
    // Create a new connector with an initial isOnline value of true
    const createdConnector = await EVConnectors.create({
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 240,
      manufacturer: 'Manufacturer X',
      isOnline: true,
      chargePoint: [],
    });

    // Send a PUT request to update the isOnline field
    const response = await request(app)
        .put(`/connectors/${createdConnector._id}`) // Use the created connector's ID
        .send({isOnline: false})
        .expect(200);
    expect(response.body.message).to.equal('Charge point updated successfully');
    expect(response.body.connector.isOnline).to.equal(false);
  });
  it('should return a  error if  connector does not exist', async () => {
    // Send a DELETE request with an invalid station ID
    const invalidConnectorId = '609e11d67b4f3335940f3b9c';
    const response = await request(app)
        .put(`/connectors/${invalidConnectorId}`)
        .expect(400);
    expect(response.body.message).to.equal('Connector not found');
  });

  // Stop MongoDB Memory Server after running tests
  afterEach(async () => {
    await mongoose.disconnect(); // Disconnect from the database
    await mongoServerInUpdate.stop(); // Stop MongoDB Memory Server
  });
});
