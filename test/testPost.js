const request = require('supertest');
const {expect} = require('chai');
const {app, startingStartServer} = require('../server.js');
const {dropDB, closeConnectionDB} = require('../connection.js');
describe('Post to Connectors and Stations', () => {
  // Start MongoDB Memory Server and connect to it before running tests
  before(async () => {
    delete process.env.uri;
    await startingStartServer();
  });
  it('should create a new station', async () => {
    const stationData = {
      chargeStationName: 'IndiEV',
      address: '11th cross, Kumarswamy Layout, Bangalore',
      coordinates: [77.5946, 12.9716],
      amenities: ['restaurant', 'toilet'],
    };
    const response = await request(app)
        .post('/chargeStations')
        .send(stationData)
        .expect(200);
    expect(response.body.chargeStationName).to.equal(stationData.chargeStationName);
    expect(response.body.address).to.equal(stationData.address);
    expect(response.body.latitude).to.equal(stationData.latitude);
    expect(response.body.longitude).to.equal(stationData.longitude);
    expect(response.body.amenities).to.deep.equal(stationData.amenities);
  });

  it('should return 400 and an error message when data passing is wrong', async () => {
    const stationData = {
      // Missing required fields, which should cause a validation error
      // This will trigger the catch block
    };

    const response = await request(app)
        .post('/chargeStations')
        .send(stationData)
        .expect(400);

    expect(response.body).to.be.an('object').and.to.have.property('Stationmessage');
  });

  it('should create a new connector', async () => {
    const stationData = {
      chargeStationName: 'RelEV',
      address: '11th cross, ISRO Layout, Bangalore',
      coordinates: [74.5946, 12.9716],
      amenities: ['restaurant', 'toilet'],
    };
    const responseStation = await request(app)
        .post('/chargeStations')
        .send(stationData);

    const _idofinsertedstation = responseStation.body._id;

    const connector = {
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 240,
      manufacturer: 'Manufacturer X',
      isOnline: true,
      chargePoint: [{
        chargePointName: 'Point A',
        chargeStation: [_idofinsertedstation],
      }],
    };

    const response = await request(app)
        .post('/connectors')
        .send(connector)
        .expect(200);

    expect(response.body).to.have.property('_id');
    expect(response.body).to.have.property('connector_id', connector.connector_id);
    expect(response.body).to.have.property('connectorType', connector.connectorType);
    expect(response.body).to.have.property('wattage', connector.wattage);
    expect(response.body).to.have.property('manufacturer', connector.manufacturer);
    expect(response.body).to.have.property('isOnline', connector.isOnline);
    expect(response.body.chargePoint).to.be.an('array');
    expect(response.body.chargePoint).to.have.lengthOf(1);
    expect(response.body.chargePoint[0]).to.have.property('chargePointName', connector.chargePoint[0].chargePointName);
    expect(response.body.chargePoint[0]).to.have.property('chargeStation');
    // Assuming _idofinsertedstation is the ID of the inserted station, you might want to dynamically check if it exists
    // You may also need to modify this check depending on how you handle the station ID
    expect(response.body.chargePoint[0].chargeStation[0]).to.equal(_idofinsertedstation);
  });
  after(function(done) {
    this.timeout(30000); // Increase timeout to 10 seconds
    closeConnectionDB()
        .then(() => done());
  });
  it('should return 400 when posting to connector goes wrong', async () => {
    const connector = {
      // Missing required fields, which should cause a validation error
      // This will trigger the catch block
    };

    const response = await request(app)
        .post('/connectors')
        .send(connector)
        .expect(400);
    expect(response.body).to.be.an('object').and.to.have.property('Connectormessage');
  });
  afterEach(async () => {
    await dropDB();
  });
});
