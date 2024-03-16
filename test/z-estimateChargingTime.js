/* eslint-disable indent */
const {expect} = require('chai');
const beforeHook = require('../before');
const request = require('supertest');
const {app} = require('../server.js');
const {EVConnectors} = require('../database/data.js');
const nock = require('nock');
const {describe, it} = require('mocha');
const cleanup = require('./after.js');
const {dropDB} = require('../connection.js');

describe('Use nock to mimic API requests', () => {
    before(async () => {
        await beforeHook();
    });
    afterEach(async () => {
        await dropDB();
    });
    after(cleanup);
    it('should return connector data with estimated charging time', async () => {
        // Mocking the estimation response
        nock('http://localhost:3000')
            .get('/estimate-charging-time')
            .query({soc: 50, battcapacity: 40, power: '10'}) // Adjust parameters according to your implementation
            .reply(200, {estimationChargingTime: 2});

        // Create a mock connector
        const connectorDataToPerformCreate = {
            connector_id: 1234,
            connectorType: 'Type-A',
            wattage: '10',
            manufacturer: 'Manufacturer -D',
            isOnline: true,
        };
        const connectorDataCreated = await EVConnectors.create(connectorDataToPerformCreate);

        // Make a request to the endpoint
        const connectorResultReturnedOnEstiChargeTime = await request(app)
            .get(`/connectors/chargingTime/${connectorDataCreated._id}`)
            .send({soc: 50, battCapacity: 40}) // Adjust parameter names according to your implementation
            .expect(200);

        // Assert that the estimated charging time is as expected
        expect(connectorResultReturnedOnEstiChargeTime.body.estimateChargingTimeInHours).to.equal(2);
    });
});
