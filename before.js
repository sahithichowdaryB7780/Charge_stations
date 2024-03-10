// beforeHook.js
const {startingStartServer} = require('./server');

async function beforeHook() {
  delete process.env.uri;
  await startingStartServer();
}

module.exports = beforeHook;
