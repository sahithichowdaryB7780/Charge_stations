const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
async function connect(uri) {
  try {
    await mongoose.connect(uri);
    console.log(`connected to ${uri}`);
  } catch (error) {
    console.log('Error connecting to Db');
  }
}
let mongoServer;
async function getURL() {
  mongoServer = await MongoMemoryServer.create();
  return await mongoServer.getUri();
}


async function dropDB() {
  await mongoose.connection.db.dropDatabase();
}

async function closeConnectionDB() {
  await mongoose.disconnect();
}

module.exports = {
  connect,
  getURL,
  dropDB,
  closeConnectionDB,
};
