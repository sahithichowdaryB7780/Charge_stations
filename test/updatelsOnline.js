const {expect} = require('chai');
<<<<<<< HEAD
const request = require('supertest');
const {connect, dropDB, closeConnectionDB} = require('../connection.js');
const {app, seturi} = require('../server.js');
const {EVConnectors} = require('../database/data.js');


describe('Update isOnline Field in Connectors', () => {
  before(async () => {
    delete process.env.uri;
    const uri = await seturi();
    await connect(uri);
=======
const {connect, dropDB, closeConnectionDB} = require('../connection.js');
const {app, seturi} = require('../server.js');
const {EVConnectors} = require('../database/data.js');
const request = require('supertest');
describe('Update isOnline Field in Connectors', () => {
  before(async () => {
    delete process.env.uri;
    const uriInUpdateOnline = await seturi();
    await connect(uriInUpdateOnline);
>>>>>>> dd6346fed69cd31679e9e0770d0ccd21e574784a
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
  it('should return a 400 error if  connector does not exist', async () => {
    // Send a DELETE request with an invalid station ID
    const invalidConnectorIdInUpdateOnline = '609e11d67b4f3335940f3b9c';
    const response = await request(app)
        .put(`/connectors/${invalidConnectorIdInUpdateOnline}`)
        .expect(400);
    expect(response.body.message).to.equal('Connector not found');
  });
<<<<<<< HEAD
  after(async () => {
    await closeConnectionDB();
  });
  afterEach(async () => {
    await dropDB();
=======
  afterEach(async () => {
    await dropDB();
  });
  after(async () => {
    await closeConnectionDB();
>>>>>>> dd6346fed69cd31679e9e0770d0ccd21e574784a
  });
});
