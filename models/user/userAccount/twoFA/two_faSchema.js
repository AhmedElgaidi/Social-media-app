const mongoose = require("mongoose");

// ================================================
const Schema = mongoose.Schema;

const two_faSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  totp: {
    temp_secret: String,
    secret: String,
  },
});

// ==================================================
// Let's export our created model
module.exports = two_faSchema;
