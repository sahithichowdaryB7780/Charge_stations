const {expect} = require('chai');
const request = require('supertest');
const {dropDB} = require('../connection.js');
const {app} = require('../server.js');
const cleanup = require('./after.js');
const beforeHook = require('../before');
const {EVConnectors} = require('../database/data.js');

describe('Update isOnline Field in Connectors', () => {
  before(async () => {
    await beforeHook();
  });
  it('should update the isOnline field when the connector exists', async () => {
    const createdConnector = await EVConnectors.create({
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 240,
      manufacturer: 'Manufacturer X',
      isOnline: true,
      chargePoint: [],
    });

    const response = await request(app)
        .put(`/connectors/${createdConnector._id}`)
        .send({isOnline: false})
        .expect(200);
    expect(response.body.message).to.equal('Charge point updated successfully');
    expect(response.body.connector.isOnline).to.equal(false);
  });
  after(cleanup);
  it('should return a 400 error if  connector does not exist', async () => {
    const invalidConnectorIdInUpdateOnline = '609e11d67b4f3335940f3b9c';
    const response = await request(app)
        .put(`/connectors/${invalidConnectorIdInUpdateOnline}`)
        .expect(400);
    expect(response.body.message).to.equal('Connector not found');
  });
  afterEach(async () => {
    await dropDB();
  });
});
