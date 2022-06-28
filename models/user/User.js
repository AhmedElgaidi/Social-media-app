const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Our User sub documents
const UserInfoSchema = require("./userInfo/userInfoSchema");
const UserAccountSchema = require("./userAccount/userAccountSchema");
const { hash } = require("bcrypt");

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
userSchema.methods.generateAndSignAccessAndRefreshTokens = async function () {
  // (1) Generate access token
  const access_token = await jwt.sign(
    { _id: this.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );

  // (2) Generate refresh token
  const refresh_token = await jwt.sign(
    { _id: this.id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );

  // (3) Assign tokens to user document
  this.account.tokens_list.push({
    access_token,
    refresh_token,
  });
};

// Create email verification token
userSchema.methods.createEmailVerificationToken = async function () {
  // create token
  const token = await jwt.sign(
    { _id: this.id },
    process.env.EMAIL_VERIFICATION_TOKEN_SECRET,
    {
      expiresIn: process.env.EMAIL_VERIFICATION_TOKEN_SECRET_EXPIRES_IN,
    }
  );

  // Assign it to the user document
  this.account.email.verification.token = token;
  return token;
};

// ==================================================
// Let's export our User model
module.exports = mongoose.model("User", userSchema);
