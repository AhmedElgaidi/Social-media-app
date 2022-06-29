const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ================================================
const Schema = mongoose.Schema;

const userPasswordSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  value: {
    type: String,
    required: [true, "Please, provide us with your password!"],
    minlength: [
      8,
      "Please, provide us with a longer password (8-16 characters) ",
    ],
    maxlength: [
      16,
      "Please, provide us with a shorter password (8-16 characters) ",
    ],
    trim: true,
  },
  confirm_password: {
    type: String,
    trim: true,
    required: [true, "Please, confirm your password"],
    validate: {
      validator: function (str) {
        return str === this.value;
      },
      message: "Passwords don't match!",
    },
  },
  passwordChangedAt: [
    {
      type: Date, // time of first creation or any modification later
      default: Date.now
    },
  ],
});

// ==================================================
// Our hooks/ middlewares
// Hash the password
userPasswordSchema.pre("save", async function (next) {
  // We want only to encrypt the password fields only when saving or updating password field
  // Imagine the user is updating his email, we don't want to re-encrypt the password again, right?
  // There is a method called isModified(), we can call it on any doc field
  if (!this.isModified("value")) return next();

  // otherwise, is the hash the password
  this.value = await bcrypt.hash(this.value, 12); // 12 is the salt round
  // now, we don't want to use the passwordConfirm field anymore, we just used it for validation
  // we don't have to hash it too
  // So, give it the undefined value (by this move, we deleted the field)
  // It's good to do this, especially in case of data breaches!!!!
  this.confirm_password = undefined;
  next();
});

// Assign the time of user changing his password
userPasswordSchema.pre("save", async function (next) {
  // we want to assign the field passwordChangedAt with the date of now, only if the field
  // it's modified or when creation a user account for the first time

  // if the password didn't change
  // we also need exclude the first modify as when creating a new account we change it from
  // undefined to the user password
  if (this.isModified("passwordChangedAt")) return next();

  // if user changed his password
  this.passwordChangedAt = Date.now();
  next();
});

// ==================================================
// Our methods

// ==================================================
// Let's export our created model
module.exports = userPasswordSchema;
