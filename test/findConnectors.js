const {expect} = require('chai');
const request = require('supertest');
const {EVConnectors, EVChargeStation} = require('../database/data.js');
const {app, startingStartServer} = require('../server.js');
const cleanup = require('./after.js');
const {dropDB} = require('../connection.js');
describe('Find Connectors of specified Type', () => {
  before(async () => {
    delete process.env.uri;
    await startingStartServer();
  });

  it('should return connectors of the specified type and status 200 if successful', async () => {
    const stationDataInGet = {
      chargeStationName: 'AdEV',
      address: '1st cross, ISRO Layout, Bangalore',
      coordinates: [77.5946, 12.9716],
      amenities: ['toilet'],
    };

    const responseStationInGet = await EVChargeStation.create(stationDataInGet);

    const _idofinsertedstationinget = responseStationInGet._id;

    await EVConnectors.create([
      {
        connector_id: 1,
        connectorType: 'Type A',
        wattage: 240,
        manufacturer: 'Manufacturer X',
        isOnline: true,
        chargePoint: {
          chargePointName: 'Hp1',
          chargeStation: _idofinsertedstationinget,
        },
      },
      {
        connector_id: 2,
        connectorType: 'Type B',
        wattage: 280,
        manufacturer: 'Manufacturer X',
        isOnline: true,
        chargePoint: {
          chargePointName: 'Hp1',
          chargeStation: _idofinsertedstationinget,
        },
      },
    ]);
    // Make request to retrieve connectors of the  type A
    const Getresponse = await request(app)
        .get('/connectors/existing/Type A')
        .expect(200);
    expect(Getresponse.body).to.be.an('array');
    expect(Getresponse.body).to.have.lengthOf(1);
  });
  afterEach(async () => {
    await dropDB();
  });
  it('should return status 400 and an error message if no connectors are found for the specified type', async () => {
    const nonExistentConnectorType = 'Type-Y';
    const response = await request(app)
        .get(`/connectors/existing/${nonExistentConnectorType}`)
        .expect(400);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message', 'No connectors found for the specified type');
  });
  it('should return connectors of the specified type near the given coordinates', async () => {
    const stationDataForFindingStation1 = {
      chargeStationName: 'AtEV',
      address: 'Mg Road Bangalore',
      coordinates: [77.6088, 12.9754],
      amenities: ['toilet', 'restro'],
    };
    const responseStationForFindingStation1 = await request(app)
        .post('/connectors')
        .send(stationDataForFindingStation1);

    const _idofinsertedstationinForFindingStation1 = responseStationForFindingStation1.body._id;

    const stationDataForFindingStation2 = {
      chargeStationName: 'ArEV',
      address: 'Cubbon Park',
      coordinates: [77.5954, 12.9766],
      amenities: ['toilet'],
    };
    const responseStationForFindingStation2 = await request(app)
        .post('/connectors')
        .send(stationDataForFindingStation2);
    const _idofinsertedstationinForFindingStation2 = responseStationForFindingStation2.body._id;

    await EVConnectors.create([
      {
        connector_id: 1,
        connectorType: 'Type A',
        wattage: 340,
        manufacturer: 'Manufacturer O',
        isOnline: false,
        chargePoint: {
          chargePointName: 'Hp2',
          chargeStation: _idofinsertedstationinForFindingStation1,
        },
      },
      {
        connector_id: 13,
        connectorType: 'Type A',
        wattage: 640,
        manufacturer: 'Manufacturer L',
        isOnline: false,
        chargePoint: {
          chargePointName: 'Hi2',
          chargeStation: _idofinsertedstationinForFindingStation2,
        },
      },
    ]);
    const response =await request(app)
        .get('/connectors/Type A/77.6405/12.9733')
        .expect(200);
    expect(response.body).to.be.an('array');
  });
  after(cleanup);
  /* it('should return connectors of the specified type near the given coordinates', async () => {
    // Mock charge station data
    const chargeStationData = {
      chargeStationName: 'TestStation',
      address: 'Test Address',
      coordinates: [77.5946, 12.9716],
    };
    const mockChargeStation = await EVChargeStation.create(chargeStationData);
    const connectorData = {
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 270,
      manufacturer: 'Manufacturer P',
      isOnline: false,
      chargePoint: {
        chargePointName: 'TestPoint1',
        chargeStation: mockChargeStation._id,
      },
    };
    await EVConnectors.create(connectorData);
    const response = await request(app)
        .get('/connectors/Type A/close-to/12.9716/77.5946')
        .expect(200);
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.be.at.least(1);
    expect(response.body[0].connectorType).to.equal('Type A');
  });*/
});
