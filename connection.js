const mongoose = require('mongoose');
const app = require('./server');
let server;

async function startServer(port, url) {
  let currentPort = port;
  let serverStarted = false;

  while (!serverStarted) {
    server = await app.listen(currentPort);
    console.log(`Running on port ${currentPort}`);

    serverStarted = true; // Assume server is started successfully unless an error occurs

    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        // Port in use, try the next port
        console.log(`Port ${currentPort} is in use, trying the next port...`);
        currentPort++;
      } else {
        console.error('', error.message);
        serverStarted = false; // Server failed to start due to error
      }
    });
  }

  await connect(url); // Connect to DB
}

async function connect(uri) {
  try {
    await mongoose.connect(uri);
    console.log(`Connected to DB`);
  } catch (error) {
    console.log('Error connecting to DB:');
  }
}

async function stopServer() {
  server.close();
}

async function dropDB() {
  await mongoose.connection.db.dropDatabase();
}

async function closeConnectionDB() {
  await mongoose.disconnect();
}

module.exports = {
  connect,
  stopServer,
  dropDB,
  closeConnectionDB,
  app,
  startServer,
};

/* const mongoose = require('mongoose');
const app = require('./server');
let server;

/* const startServer = {
  PORT: null,
  URL: null,
  async setConfigurations(port, url) {
    this.PORT = port;
    this.URL = url;
    await connect(this.URL); // Connect to DB
    server = app.listen(this.PORT, () => {
      console.log(`Running on port ${this.PORT}`);
    });
  },
};
const startServer = {
  PORT: null,
  URL: null,

  async setPortUrl(port, url) {
    this.PORT = port;
    this.URL = url;

    // Connect to DB and start server
    server = await app.listen(this.PORT);
    console.log(`Running on port ${this.PORT}`);

    // Handle server startup errors
    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        // Port in use, try next port
        await this.setConfigurations(this.PORT + 1, this.URL);
      } else {
        console.error('', error.message);
      }
    });

    // Connect to database after server starts
    await connect(this.URL); // Connect to DB
  },
};
async function connect(uri) {
  try {
    await mongoose.connect(uri);
    console.log(`Connected to DB`);
  } catch (error) {
    console.log('Error connecting to DB');
  }
}


async function stopServer() {
  server.close();
}

async function dropDB() {
  await mongoose.connection.db.dropDatabase();
}

async function closeConnectionDB() {
  await mongoose.disconnect();
}

module.exports = {
  connect,
  stopServer,
  dropDB,
  closeConnectionDB,
  app,
  startServer,
};*/

