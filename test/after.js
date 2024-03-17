const {closeConnectionDB} = require('../connection.js');

function cleanup() {
  // this.timeout(30000); // Increase timeout to 30 seconds
  closeConnectionDB();
  // .then(() => done());
}

module.exports = cleanup;
