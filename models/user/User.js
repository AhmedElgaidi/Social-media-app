const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Our User sub documents
const UserInfoSchema = require("./userInfo/userInfoSchema");
const UserAccountSchema = require("./userAccount/userAccountSchema");

// ================================================
const Schema = mongoose.Schema;

const schemaOptions = {
  // let's add some options to our user schema
  timestamps: true, // To add createdAt and updatedAt fields
  toJSON: {
    // to display our virtual methods in case of asked data in json form
    virtuals: true,
  },
  toObject: {
    // In case of object form
    virtuals: true,
  },
  versionKey: false, // To remove __v field
};

const userSchema = new Schema(
  {
    info: UserInfoSchema, // User personal data
    account: UserAccountSchema, // User account data
  },
  schemaOptions
);

// =================================================
// Our hooks (middlewares)

// =================================================
// Our methods



// ==================================================
// Let's export our User model
module.exports = mongoose.model("User", userSchema);
