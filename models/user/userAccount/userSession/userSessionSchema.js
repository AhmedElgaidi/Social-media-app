const mongoose = require("mongoose");
const userDeviceInfoSchema = require("./userDeviceInfo/userDeviceInfoSchema");

// ================================================
const Schema = mongoose.Schema;

const userSessionSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  tokens: {
    access_token: {
      value: {
        type: String,
        // default: "sdfsfw2f!@#4e",
      },
      is_Active: {
        type: Boolean,
        default: true,
      },
    },
    refresh_token: {
      value: {
        type: String,
        // default: "sdfsfw2f!@#4e",
      },
      is_Active: {
        type: Boolean,
        default: true,
      },
    },
  },
  device: userDeviceInfoSchema,
});

// ==================================================
// Let's export our created model
module.exports = userSessionSchema;
