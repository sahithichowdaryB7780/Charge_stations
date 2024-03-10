/* eslint-disable indent */
const {expect} = require('chai');
const request = require('supertest');
const {app, startingStartServer} = require('../server.js');
const {EVConnectors} = require('../database/data.js');
const nock = require('nock');
const {describe, it} = require('mocha');
const cleanup = require('./after.js');
const {dropDB} = require('../connection.js');

describe('Use nock to mimic API requests', () => {
    before(async () => {
        delete process.env.uri;
        await startingStartServer();
    });
    afterEach(async () => {
        await dropDB();
    });
    after(cleanup);
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
});
