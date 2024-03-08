const mongoose = require('mongoose');
// Records Charge station details
const evChargeStationSchema = new mongoose.Schema({
  chargeStationName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  amenities: [String],
});

// Records Charge point details, refers to charge stations
const chargePointSchema = new mongoose.Schema({
  chargePointName: {
    type: String,
    required: true,
  },
  chargeStation: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EVChargeStation',
  }],

});

// A connectorSchema contains all details according to use case and it is exported
const connectorSchema = new mongoose.Schema({
  connector_id: {
    type: Number,
    required: true,
  },
  connectorType: {
    type: String,
    required: true,
  },
  wattage: {
    type: Number,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  isOnline: {
    type: Boolean,
    required: true,
  },
  chargePoint: [chargePointSchema],
});

const EVConnectors = mongoose.model('EVConnector', connectorSchema);
const EVChargeStation = mongoose.model('EVChargeStation', evChargeStationSchema);

module.exports = {
  EVConnectors,
  EVChargeStation,
};
