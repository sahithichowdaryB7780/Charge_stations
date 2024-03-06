const {EVChargeStation} = require('./database/data.js');
const {EVConnectors} = require('./database/data.js');
const getConnectorsByGeoLocation = async (latitude, longitude, type) => {
  // Query for charge stations near the given latitude and longitude
  const chargeStations = await EVChargeStation.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude], // Note: Order is [longitude, latitude]
        },
        $maxDistance: 100000,
      },
    },
  });

  // Extract charge station IDs
  const chargeStationIds = chargeStations.map((station) => station._id);

  // Query for connectors of the specified type and associated with the found charge stations
  const connectors = await EVConnectors.find({
    'connectorType': type,
    'chargePoint.chargeStation': {$in: chargeStationIds},
  });

  return connectors;
};
module.exports = {getConnectorsByGeoLocation};
