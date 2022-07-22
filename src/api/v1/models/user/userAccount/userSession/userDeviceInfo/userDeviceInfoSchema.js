const mongoose = require("mongoose");

// ================================================
const Schema = mongoose.Schema;

const userDeviceInfoSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  os: {
    name: {
      type: String,
    },
    short_name: {
      type: String,
    },
    version: {
      type: String,
    },
    platform: {
      type: String,
    },
    family: {
      type: String,
    },
  },
  client: {
    type: {
      type: String,
    },
    name: {
      type: String,
    },
    short_name: {
      type: String,
    },
    version: {
      type: String,
    },
    engine: {
      type: String,
    },
    engine_version: {
      type: String,
    },
    family: {
      type: String,
    },
  },
  device: {
    id: {
      type: String,
    },
    type: {
      type: String,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    code: {
      type: String,
    },
  },
});

// ==================================================
// Let's export our created model
module.exports = userDeviceInfoSchema;
