const mongoose = require("mongoose");

// ================================================
const Schema = mongoose.Schema;

const userPasswordResetSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  password_reset_token: String,
  reset_at: Date,
});

// ==================================================
userPasswordResetSchema.pre("save", async function (next) {
  // If there is no modification in this field, do nothing!!
  if (!this.isModified("password_reset_token") || this.isNew) return next();

  // if user changed his password
  this.reset_at = Date.now();
  next();
});

// ==================================================
// Let's export our created model
module.exports = userPasswordResetSchema;
