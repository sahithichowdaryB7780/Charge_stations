const sinon = require('sinon');
const {app, startingStartServer} = require('../server.js');

describe('startServer function', () => {
  let appListenStub;

  beforeEach(() => {
    // Mock the server object
    const server = {
      on: sinon.stub(), // Stub the `on` method
    };

    // Stub app.listen function to return the mock server
    appListenStub = sinon.stub(app, 'listen').returns(server);

    // Stub the `on` method of the server to simulate an error
    server.on.withArgs('error').callsFake((event, callback) => {
      const fakeError = new Error('Some other error occurred');
      callback(fakeError);
    });
  });

  afterEach(() => {
    // Restore stubs after each test
    appListenStub.restore();
  });

  it('should log an error message when an error other than EADDRINUSE occurs during server listening', async () => {
    // Stub console.error function to capture its output
    const consoleErrorStub = sinon.stub(console, 'error');

    // Execute the code snippet
    await startingStartServer();

    // Verify that console.error was called with the correct message
    sinon.assert.calledWithExactly(consoleErrorStub, 'An error occurred:', 'Some other error occurred');

    // Restore the stubs after the test
    consoleErrorStub.restore();
  });
});
