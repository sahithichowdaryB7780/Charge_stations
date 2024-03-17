const {dropDB} = require('../connection.js');
const {app} = require('../connection.js');
const {expect} = require('chai');
const request = require('supertest');
const nock = require('nock');
const {closeConnectionDB, stopServer} = require('../connection.js');
const {EVChargeStation} = require('../database/data.js');
const {MongoMemoryServer} = require('mongodb-memory-server');
const {startServer} = require('../connection.js');
const {EVConnectors} = require('../database/data.js');
describe('Crud operations', () => {
  before(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const memoryServerUri = await mongoServer.getUri();
    startServer(8080, memoryServerUri);
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
  it('should return a 400 error if the station does not exist', async () => {
    // Send a DELETE request with an invalid station ID
    const invalidStationId = '609e11d67b4f3335940f3b9c';
    const response = await request(app)
        .delete(`/stations/${invalidStationId}`)
        .expect(400);
    expect(response.body.message).to.equal('Station not found');
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
    const response = await request(app)
        .get('/connectors/Type A/77.6405/12.9733')
        .expect(200);
    expect(response.body).to.be.an('array');
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
  it('should update the isOnline field when the connector exists', async () => {
    const createdConnector = await EVConnectors.create({
      connector_id: 1,
      connectorType: 'Type A',
      wattage: 240,
      manufacturer: 'Manufacturer X',
      isOnline: true,
      chargePoint: [],
    });

    const response = await request(app)
        .put(`/connectors/${createdConnector._id}`)
        .send({isOnline: false})
        .expect(200);
    expect(response.body.message).to.equal('Charge point updated successfully');
    expect(response.body.connector.isOnline).to.equal(false);
  });
  it('should return a 400 error if  connector does not exist', async () => {
    const invalidConnectorIdInUpdateOnline = '609e11d67b4f3335940f3b9c';
    const response = await request(app)
        .put(`/connectors/${invalidConnectorIdInUpdateOnline}`)
        .expect(400);
    expect(response.body.message).to.equal('Connector not found');
  });
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

  afterEach(async () => {
    await dropDB();
  });

  /* after(async () => {
    await closeConnectionDB();
    stopServer();
  });*/
  after(async () => {
    await closeConnectionDB();
    stopServer()
        .then(() => {
          require('../index.js');
          closeConnectionDB();
          stopServer();
        });
  });
});
