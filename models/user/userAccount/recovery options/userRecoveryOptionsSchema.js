const mongoose = require("mongoose");

// ================================================
const Schema = mongoose.Schema;

const userRecoveryOptionsSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  methodOne: {
    // Backup codes
    codes: [
      {
        _id: false,
        code: String,
        is_used: {
          type: Boolean,
          default: false,
        },
        is_used_at: Date,
      },
    ],
    temp_codes: [String],
    is_enabled: {
      type: Boolean,
      default: false,
    },
    changed_at: Date,
  },
  methodTwo: {},
});

// ==================================================

userRecoveryOptionsSchema.pre("save", async function (next) {
  if (!this.isModified("methodOne.is_enabled")) return next();
  this.methodOne.changed_at = Date.now();
  next();
});

// ==================================================
// Let's export our created model
module.exports = userRecoveryOptionsSchema;
