const {startingStartServer} = require('../index');
const {expect} = require('chai');
const sinon = require('sinon');

// Importing dotenv for direct reference
const dotenv = require('dotenv');

// Creating a Sinon sandbox
const sandbox = sinon.createSandbox();

describe('server.js', () => {
  beforeEach(() => {
    // Stubbing dotenv.config() to avoid actual environment variable loading
    sandbox.stub(dotenv, 'config');
  });

  afterEach(() => {
    // Restoring all stubbed methods after each test
    sandbox.restore();
  });

  it('should start the server', () => {
    // Call the function
    startingStartServer();

    // Assert that dotenv.config was called
    expect(dotenv.config.calledOnce).to.be.true;
  });
});
