const mongoose = require("mongoose");
const UserEmailSchema = require("./userEmail/userEmailSchema");
const userSessionSchema = require("./userSession/userSessionSchema");

// ================================================
const Schema = mongoose.Schema;

const userAccountSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  email_list: [UserEmailSchema], // User email/ session/ device data
  password: {
    type: String,
    trim: true,
  },
  session: [userSessionSchema], // Session access/ refresh tokens and device info
});

// ==================================================
// Let's export our created model
module.exports = userAccountSchema;
