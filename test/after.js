const {closeConnectionDB} = require('../connection.js');

function cleanup(done) {
  this.timeout(30000); // Increase timeout to 30 seconds
  closeConnectionDB()
      .then(() => done());
}

module.exports = cleanup;
