const mongoose = require("mongoose");
const userEmailSchema = require("./userEmail/userEmailSchema");
const userPasswordSchema = require("./userPassword/userPasswordSchema");
const userSessionSchema = require("./userSession/userSessionSchema");
const userAccountActivationSchema = require("./userActivation/userAccountActivationSchema");
const userPasswordResetSchema = require("./userReset/userPasswordResetSchema");
const two_faSchema = require("./twoFA/two_faSchema");
const userRecoveryOptionsSchema = require("./recovery options/userRecoveryOptionsSchema");

// ================================================
const Schema = mongoose.Schema;

const userAccountSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  email: userEmailSchema, // User email/ session/ device data
  password: userPasswordSchema, // User password data
  activation: userAccountActivationSchema, // User activation methods/ data
  reset: userPasswordResetSchema,
  two_fa: two_faSchema,
  session: [userSessionSchema], // Session access/ refresh tokens and device info
  recovery: userRecoveryOptionsSchema,
});

// ==================================================
// Let's export our created model
module.exports = userAccountSchema;
