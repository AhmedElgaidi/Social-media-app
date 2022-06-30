const mongoose = require("mongoose");
const userDeviceInfoSchema = require("./userDeviceInfo/userDeviceInfoSchema");

// ================================================
const Schema = mongoose.Schema;

const userSessionSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  tokens: {
    access_token: {
      type: String,
    },
    refresh_token: {
      type: String,
    },
  },
  device: userDeviceInfoSchema,
});

// ==================================================
// Let's export our created model
module.exports = userSessionSchema;
