const mongoose = require("mongoose");

// ================================================
const Schema = mongoose.Schema;

const userAccountActivationSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  is_account_active: {
    type: Boolean,
    default: true,
  },
  account_activation_token: String,
  account_activation_status_changed_at: Date
});

// ==================================================
// Our mongoose middlewares
userAccountActivationSchema.pre("save", async function (next) {
  // If there is no modification in this field, do nothing!!
  if (!this.isModified("is_account_active") || this.isNew) return next();

  // if user changed his password
  this.account_activation_status_changed_at = Date.now();
  next();
});

// ==================================================
// Let's export our sub schema
module.exports = userAccountActivationSchema;
