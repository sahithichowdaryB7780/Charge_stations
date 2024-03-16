const {dropDB, closeConnectionDB} = require('../connection.js');
const {app} = require('../server.js');
const {expect} = require('chai');
const request = require('supertest');
const cleanup = require('./after.js');
const {EVChargeStation} = require('../database/data.js');
const beforeHook = require('../before');
describe('Delete Stations', () => {
  before(async () => {
    await closeConnectionDB();
    await beforeHook();
  });

  it('should delete the station and return a success message', async () => {
    const newStation = await EVChargeStation.create({
      chargeStationName: 'Test Station',
      address: '123 Test Street',
      amenities: ['wifi', 'coffee'],
    });

    // Send a DELETE request to delete the station
    const response = await request(app)
        .delete(`/stations/${newStation._id}`)
        .expect(200);
    expect(response.body.message).to.equal('Station deleted successfully');
    expect(response.body.deletedStation._id).to.equal(newStation._id.toString());
    const deletedStation = await EVChargeStation.findById(newStation._id);
    expect(deletedStation).to.be.null;
  });
  after(cleanup);
  it('should return a 400 error if the station does not exist', async () => {
    // Send a DELETE request with an invalid station ID
    const invalidStationId = '609e11d67b4f3335940f3b9c';
    const response = await request(app)
        .delete(`/stations/${invalidStationId}`)
        .expect(400);
    expect(response.body.message).to.equal('Station not found');
  });
  afterEach(async () => {
    await dropDB();
  });
});
