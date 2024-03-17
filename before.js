// beforeHook.js
const {startingStartServer} = require('./server');
async function beforeHook() {
  // Check if Mongoose connection is open, if so, close it
  delete process.env.uri;
  await startingStartServer();
}


module.exports = beforeHook;
