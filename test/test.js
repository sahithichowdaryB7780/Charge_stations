const {expect} = require('chai');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const {app, connect} = require('../server.js');
const {EVConnectors} = require('../database/model.js');

describe('CRUD operations', () => {
  let mongoServer;

  // Start MongoDB Memory Server and connect to it before running tests
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connect(); // Establish database connection
  });


  // Stop MongoDB Memory Server after running tests
  afterEach(async () => {
    await mongoose.disconnect(); // Disconnect from the database
    await mongoServer.stop(); // Stop MongoDB Memory Server
  });

//It posts new station details
  it('should create a new station', async () => {
    const stationData = {
      chargeStationName: 'IndiEV',
      address: '11th cross, Kumarswamy Layout, Bangalore',
      latitude: 12.34,
      longitude: 56.78,
      amenities: ['restaurant', 'toilet'],
    };
    // Send POST request to /chargeStationsPost endpoint with stationData
    const response = await request(app)
        .post('/chargeStationsPost')
        .send(stationData)
        .expect(200);
    // Verify response body matches the data sent in the request
    expect(response.body.chargeStationName).to.equal(stationData.chargeStationName);
    expect(response.body.address).to.equal(stationData.address);
    expect(response.body.latitude).to.equal(stationData.latitude);
    expect(response.body.longitude).to.equal(stationData.longitude);
    expect(response.body.amenities).to.deep.equal(stationData.amenities);
  });

  // ----------------------------------------------------------//
  
//It fails in posting new station details
  it('should return 500 and an error message when an error occurs', async () => {
    const stationData = {
      // Missing required fields, which should cause a validation error
      // This will trigger the catch block
    };

    const response = await request(app)
        .post('/chargeStationsPost')
        .send(stationData)
        .expect(500);

    expect(response.body).to.be.an('object').and.to.have.property('Stationmessage');
  });


  // ----------------------------------------------------------//
  
//It posts constructor details
  it('should create a new connector', async () => {
    const stationData = {
      chargeStationName: 'RelEV',
      address: '11th cross, ISRO Layout, Bangalore',
      latitude: 10.34,
      longitude: 54.78,
      amenities: ['restaurant', 'toilet'],
    };

    // Send POST request to create a charge station
    const responseStation = await request(app)
        .post('/chargeStationsPost')
        .send(stationData);

    const _idofinsertedstation = responseStation.body._id;

    const connector = {
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 240,
      manufacturer: 'Manufacturer X',
      chargePoint: [{
        chargePointName: 'Point A',
        isOnline: true,
        chargeStation: [_idofinsertedstation],
      }],
    };

    const response = await request(app)
        .post('/connectorsPost')
        .send(connector)
        .expect(200);

    expect(response.body).to.have.property('_id'); // Assuming your connector model returns an _id field upon insertion
    expect(response.body).to.have.property('connector_id', connector.connector_id);
    expect(response.body).to.have.property('connectorType', connector.connectorType);
    expect(response.body).to.have.property('wattage', connector.wattage);
    expect(response.body).to.have.property('manufacturer', connector.manufacturer);
    expect(response.body.chargePoint).to.be.an('array');
    expect(response.body.chargePoint).to.have.lengthOf(1);
    expect(response.body.chargePoint[0]).to.have.property('chargePointName', connector.chargePoint[0].chargePointName);
    expect(response.body.chargePoint[0]).to.have.property('isOnline', connector.chargePoint[0].isOnline);
    expect(response.body.chargePoint[0]).to.have.property('chargeStation');
    expect(response.body.chargePoint[0].chargeStation[0]).to.equal(_idofinsertedstation);
  });
  // ----------------------------------------------------------//
  //It failed in posting connector details
  it('should return 500 when an error occurs in posting to connector', async () => {
    const connector = {
      // Missing required fields, which should cause a validation error
      // This will trigger the catch block
    };

    const response = await request(app)
        .post('/connectorsPost')
        .send(connector)
        .expect(500);
    expect(response.body).to.be.an('object').and.to.have.property('Connectormessage');
  });
  // ----------------------------------------------------------//
  
  //It returs sucess if given connector type type exists in station
  it('should return connectors of the specified type and status 200 if successful', async () => {
    const stationDataInGet = {
      chargeStationName: 'AdEV',
      address: '1st cross, ISRO Layout, Bangalore',
      latitude: 53.34,
      longitude: 5.78,
      amenities: ['toilet'],
    };

    // Send POST request to create a charge station
    const responseStationInGet = await request(app)
        .post('/chargeStationsPost')
        .send(stationDataInGet);

    const _idofinsertedstationinget = responseStationInGet.body._id;

    await EVConnectors.create([
      {
        connector_id: 1,
        connectorType: 'Type A',
        wattage: 240,
        manufacturer: 'Manufacturer X',
        chargePoint: {
          chargePointName: 'Hp1',
          isOnline: true,
          chargeStation: _idofinsertedstationinget,
        },
      },
      {
        connector_id: 2,
        connectorType: 'Type B',
        wattage: 280,
        manufacturer: 'Manufacturer X',
        chargePoint: {
          chargePointName: 'Hp1',
          isOnline: true,
          chargeStation: _idofinsertedstationinget,
        },
      },
    ]);

    // Makeing request to retrieve connectors of the specified type
    const Getresponse = await request(app)
        .get('/connectorsGet/Type A')
        .expect(200);
    expect(Getresponse.body).to.be.an('array');
    expect(Getresponse.body).to.have.lengthOf(1);
  });

  // ----------------------------------------------------------//
  
  //If non existent type of connector is given
  it('should return status 404 and an error message if no connectors are found for the specified type', async () => {
    const nonExistentConnectorType = 'Type-Y';

    // Making request to retrieve connectors for a nonexistent type
    const response = await request(app)
        .get(`/connectorsGet/${nonExistentConnectorType}`)
        .expect(404);

    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message', 'No connectors found for the specified type');
  });
});