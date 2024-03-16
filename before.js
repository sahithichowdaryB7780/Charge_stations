// beforeHook.js
const {startingStartServer} = require('./server');
const mongoose = require('mongoose');
async function beforeHook() {
  // Check if Mongoose connection is open, if so, close it
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  delete process.env.uri;
  await startingStartServer();
}


module.exports = beforeHook;
