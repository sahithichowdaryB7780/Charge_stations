// beforeHook.js
const {startingStartServer} = require('./index');

async function beforeHook() {
  delete process.env.uri;
  await startingStartServer();
}

module.exports = beforeHook;
