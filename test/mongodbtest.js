const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const {connect, getURL} = require('../connection.js');
const {mongoose} = require('mongoose');
chai.use(chaiAsPromised);

describe('connect function', () => {
  let logSpy;
  let mongooseConnectStub;

  beforeEach(() => {
    // Stub console.log to capture its output
    logSpy = sinon.stub(console, 'log');
    // Stub mongoose.connect to prevent actual database connection
    mongooseConnectStub = sinon.stub(mongoose, 'connect');
  });

  afterEach(() => {
    logSpy.restore();
    mongooseConnectStub.restore();
  });

  it('should log "connected to ..." message when connecting successfully', async () => {
    const uri = 'mongodb://localhost:27017/test'; // Mock URI for testing

    // Stub mongoose.connect to resolve successfully
    mongooseConnectStub.resolves();
    await connect(uri);
    sinon.assert.calledWithExactly(logSpy, `connected to ${uri}`);
  });

  it('should log an error message when failing to connect', async () => {
    const uri = 'invalid uri'; // Invalid URI to simulate connection failure
    const errorMock = new Error('Connection error');

    // Stub mongoose.connect to reject with an error
    mongooseConnectStub.rejects(errorMock);
    await connect(uri);
    sinon.assert.calledWithExactly(logSpy, 'Error connecting to Db');
  });
  it('should log "connected to Mongodb memory server" message when connecting successfully', async () => {
    delete process.env.uri;
    const uri = await getURL();
    mongooseConnectStub.resolves();

    await connect(uri);

    sinon.assert.calledWithExactly(logSpy, `connected to ${uri}`);
  });
});
/* const {connect} = require('../connection.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

chai.use(chaiAsPromised);
const {expect} = chai;

describe('connect function', () => {
  let logSpy;

  beforeEach(() => {
    // Stub console.log to capture its output
    logSpy = sinon.stub(console, 'log');
  });

  afterEach(() => {

    logSpy.restore();
  });

  it('should log "connected to ..." message and start server', async () => {
    const uri = 'mongodb://localhost:27017/test'; // Mock URI for testing
    const PORT = 3005;
    await expect(connect(uri)).to.eventually.be.fulfilled;

    sinon.assert.calledWithExactly(logSpy, `connected to ${uri}`);

    sinon.assert.calledWithExactly(logSpy, `Server is running on port ${PORT}`);
  });

  it('should log an error message when failing to connect', async () => {
    const uri = 'gt'; // Invalid URI to simulate connection failure

    await expect(connect(uri)).to.eventually.be.rejected;

    sinon.assert.calledWithExactly(logSpy, 'Error connecting to DB');
  });
});*/


