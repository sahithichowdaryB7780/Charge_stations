const {connect, dropDB, closeConnectionDB} = require('../connection.js');
const {app, seturi} = require('../server.js');
const {expect} = require('chai');
const request = require('supertest');
const {EVChargeStation} = require('../database/data.js');
describe('Delete Stations', () => {
  before(async () => {
    delete process.env.uri;
    const uri = await seturi();
    await connect(uri);
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
  it('should return a 400 error if the station does not exist', async () => {
    // Send a DELETE request with an invalid station ID
    const invalidStationId = '609e11d67b4f3335940f3b9c'; // Assuming this ID doesn't exist
    const response = await request(app)
        .delete(`/stations/${invalidStationId}`)
        .expect(400); // Check the response body
    expect(response.body.message).to.equal('Station not found');
  });
  afterEach(async () => {
    await dropDB();
  });
  after(async () => {
    await closeConnectionDB();
  });
});
