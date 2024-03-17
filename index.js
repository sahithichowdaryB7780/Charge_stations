const {startServer} = require('./connection');
process.env.PORT = 8080;
process.env.MONGO_URL = 'mongodb://0.0.0.0:27017/test';
startServer(process.env.PORT, process.env.MONGO_URL);

