const mongoose = require("mongoose");
const validator = require("validator");

// ================================================
const Schema = mongoose.Schema;

const userEmailSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  email: {
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
  is_secondary: {
    type: Boolean,
    default: false,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
});

// ==================================================
// Let's export our created model
module.exports = userEmailSchema;