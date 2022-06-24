const mongoose = require("mongoose");

// ================================================
const Schema = mongoose.Schema;

const userDeviceInfoSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  name: String,
});

// ==================================================
// Let's export our created model
module.exports = userDeviceInfoSchema;
