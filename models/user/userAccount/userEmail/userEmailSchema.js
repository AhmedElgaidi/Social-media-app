const mongoose = require("mongoose");
const validator = require("validator");

// ================================================
const Schema = mongoose.Schema;

const userEmailSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  value: {
    type: String,
    unique: [true, "Please, provide us with your own email!"],
    required: [true, "Please, provide us with your email!"],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Please, provide us with a valid email!"],
    validate: {
      // to remove any special char as well as white spaces and tabs
      validator: function (str) {
        const specialChars = /[`!#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!15",
    },
  },
  verification: {
    token: {
      type: String,
    }
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  is_verified_at: Date,
  // array of trusted emails would be here
});

// ==================================================
// Our mongoose middlewares

// Assign the time of user changing his email status from secondary to primary and vice versa
userEmailSchema.pre("save", async function (next) {
  // If there is no modification in the is_secondary field, then do nothing
  if (!this.isModified("is_secondary")) return next();

  this.is_changed_at = Date.now();
  next();
});

// ==================================================
// Let's export our created model
module.exports = userEmailSchema;
