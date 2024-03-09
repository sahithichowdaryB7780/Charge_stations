const {expect} = require('chai');
const request = require('supertest');
const {dropDB, closeConnectionDB} = require('../connection.js');
const {app, startingStartServer} = require('../server.js');
const {EVConnectors} = require('../database/data.js');

describe('Update isOnline Field in Connectors', () => {
  before(async () => {
    delete process.env.uri;
    await startingStartServer();
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
  after(function(done) {
    this.timeout(30000); // Increase timeout to 10 seconds
    closeConnectionDB()
        .then(() => done());
  });
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
