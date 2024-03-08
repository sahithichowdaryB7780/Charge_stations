/* eslint-disable indent */

const {expect} = require('chai');
const request = require('supertest');
const {connect, dropDB, closeConnectionDB} = require('../connection.js');
const {app, seturi} = require('../server.js');
const {EVConnectors} = require('../database/data.js'); // Import EVConnectors model
const nock = require('nock');
const {describe, it} = require('mocha');

describe('Use nock to mimic API requests', () => {
    before(async () => {
        delete process.env.uri;
        const uri = await seturi();
        await connect(uri);
    });
  it('should return connector data with estimated charging time', async () => {
    nock('http://localhost:8080')
        .post('/estimate-charging-time')
        .reply(200, {estimateChargingTime: 2});
    const connectorDataToPerformCreate = {
      connector_id: 1234,
      connectorType: 'Type-A',
      wattage: '10',
      manufacturer: 'Manufacturer -D',
      isOnline: true,
    };
    const connectorDataCreated = await EVConnectors.create(connectorDataToPerformCreate);
    const connectorResultReturnedOnEstiChargeTime = await request(app)
        .get(`/connectors/${connectorDataCreated._id}`)
        .send({soc: 50, batteryCapacity: 40})
        .expect(200);
      expect(connectorResultReturnedOnEstiChargeTime.body.estimateChargingTime).to.equal(2);
      expect(connectorResultReturnedOnEstiChargeTime.body.connectorType).to.equal('Type-A');
      expect(connectorResultReturnedOnEstiChargeTime.body.isOnline).to.equal(true);
      expect(connectorResultReturnedOnEstiChargeTime.body.manufacturer).to.equal('Manufacturer -D');
  });
    afterEach(async () => {
        await dropDB();
    });
    after(async () => {
        await closeConnectionDB();
    });
});
