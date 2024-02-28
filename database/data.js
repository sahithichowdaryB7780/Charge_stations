const mongoose = require('mongoose');

const connectorSchema = new mongoose.Schema({
  name: String,
  chargeCapacity: String,
});

const chargePointSchema = new mongoose.Schema({
  voltsRange: String,
  numberOfConnectors: Number,
  numberOfAvailable: Number,
});

const evStationDetailsSchema = new mongoose.Schema({
  totalNumberOfChargePoints: Number,
  restaurantAccess: Boolean,
  toiletAccess: Boolean,
  pincode: String,
});

const evChargeStationSchema = new mongoose.Schema({
  connectors: connectorSchema,
  chargePoints: chargePointSchema,
  evStationDetails: evStationDetailsSchema,
});

const EVChargeStation = mongoose.model('EVChargeStation', evChargeStationSchema);

module.exports = {EVChargeStation};
