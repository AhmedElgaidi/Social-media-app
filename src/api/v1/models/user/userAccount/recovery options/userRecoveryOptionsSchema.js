const mongoose = require("mongoose");
const validator = require("validator");

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
  methodTwo: {
    // Trusted email
    email: {
      temp_value: {
        type: String,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "Please, provide us with a valid email!"],
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be a decent user!",
        },
        default: "",
      },
      value: String,
      changed_at: Date,
      verification_token: String,
      is_verified: Boolean,
      is_verified_at: Date,
    },
    is_enabled: {
      type: Boolean,
      default: false,
    },
    changed_at: Date,
    recovery_token: String,
    last_recovered_at: Date,
  },
});

// ==================================================

userRecoveryOptionsSchema.pre("save", async function (next) {
  if (!this.isModified("methodTwo.is_enabled") || this.isNew) return next();
  this.methodTwo.changed_at = Date.now();
  next();
});

// ==================================================
// Let's export our created model
module.exports = userRecoveryOptionsSchema;
