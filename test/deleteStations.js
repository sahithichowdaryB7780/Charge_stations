const {expect} = require('chai');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongooseInDelete = require('mongoose');
const request = require('supertest');
const {app, connect} = require('../server.js');
const {EVChargeStation} = require('../database/data.js');
describe('Delete Stations', () => {
  let mongoServerInDelete;
  beforeEach(async () => {
    mongoServerInDelete = await MongoMemoryServer.create();
    await connect(); // Establish database connection
  });

  it('should delete the station and return a success message', async () => {
    // Create a new station to delete
    const newStation = await EVChargeStation.create({
      chargeStationName: 'Test Station',
      address: '123 Test Street',
      latitude: 123.456,
      longitude: 456.789,
      amenities: ['wifi', 'coffee'],
    });

    // Send a DELETE request to delete the station
    const response = await request(app)
        .delete(`/stations/${newStation._id}`)
        .expect(200);

    expect(response.body.message).to.equal('Station deleted successfully');
    expect(response.body.deletedStation._id).to.equal(newStation._id.toString());

    // Check if the station is actually deleted from the database
    const deletedStation = await EVChargeStation.findById(newStation._id);
    expect(deletedStation).to.be.null;
  });
  it('should return a  error if the station does not exist', async () => {
    // Send a DELETE request with an invalid station ID
    const invalidStationId = '609e11d67b4f3335940f3b9c'; // Assuming this ID doesn't exist
    const response = await request(app)
        .delete(`/stations/${invalidStationId}`)
        .expect(404); // Check the response body
    expect(response.body.message).to.equal('Station not found');
  });
  it('should return a 500 error if an internal server error occurs', async () => {
    const response = await request(app)
        .delete(`/stations/7`)
        .expect(500);
    expect(response.body.message).to.equal('Some internal error caused in deleting');
  });
  afterEach(async () => {
    await mongooseInDelete.disconnect();
    await mongoServerInDelete.stop();
  });
});
