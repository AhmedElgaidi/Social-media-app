const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ================================================
const Schema = mongoose.Schema;

const two_faSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  totp: {
    temp_secret: String,
    secret: String,
    is_enabled: {
      type: Boolean,
      default: false,
    },
    is_changed_at: Date,
  },
  otp: {
    value: String,
    created_at: Date,
    expires_at: Date,
    is_enabled: {
      type: Boolean,
      default: false,
    },
    is_changed_at: Date,
  },
  sms: {
    phone: {
      value: Number,
      is_verified: {
        // Status of phone number verification
        type: Boolean,
        default: false,
      },
      verified_at: Date, // Date of phone number verification
    },
    value: String, // The code that would be sent to the user phone number
    created_at: Date,
    expires_at: Date,
    is_enabled: {
      // Status of enabling this third 2fa method
      type: Boolean,
      default: false,
    },
    is_changed_at: Date, // Date of changing this status
  },
  question: {
    value: {
      type: String,
      minlength: [
        5,
        "Please, provide us with a longer question (5-50 characters) ",
      ],
      maxlength: [
        50,
        "Please, provide us with a shorter question (5-50 characters) ",
      ],
      trim: true,
    },
    answer: {
      type: String,
      minlength: [
        5,
        "Please, provide us with a longer answer (5-20 characters) ",
      ],
      maxlength: [
        20,
        "Please, provide us with a shorter answer (5-20 characters) ",
      ],
      trim: true,
    },
    hint: {
      type: String,
      minlength: [
        5,
        "Please, provide us with a longer hint (5-100 characters) ",
      ],
      maxlength: [
        100,
        "Please, provide us with a shorter hint (5-100 characters) ",
      ],
      trim: true,
    },
    modified_at: Date,
    is_enabled: {
      type: Boolean,
      default: false,
    },
    is_changed_at: Date,
  },
});

// ==================================================
two_faSchema.pre("save", async function (next) {
  if (!this.isModified("totp.is_enabled") || this.isNew) return next();

  // Assign date of enabling TOTP feature
  this.totp.is_changed_at = Date.now();
  next();
});

//--------------------------------------------------------

two_faSchema.pre("save", async function (next) {
  // If there is no modification happened, then do nothing
  if (!this.isModified("otp.value")) return next();

  // otherwise, hash the otp
  if (this.otp.value) {
    this.otp.value = await bcrypt.hash(this.otp.value, 12); // 12 is the salt round
    this.otp.created_at = Date.now();
    this.otp.expires_at = Date.now() + 15 * 60 * 1000; // m /s /ms
  }
  next();
});

two_faSchema.pre("save", async function (next) {
  if (!this.isModified("otp.is_enabled") || this.isNew) return next();

  // Assign date of enabling OTP feature
  this.otp.is_changed_at = Date.now();
  next();
});

//--------------------------------------------------------

two_faSchema.pre("save", async function (next) {
  // If there is no modification happened, then do nothing
  if (!this.isModified("sms.value")) return next();

  // otherwise, hash the otp
  if (this.sms.value) {
    this.sms.value = await bcrypt.hash(this.sms.value, 12); // 12 is the salt round
    this.sms.created_at = Date.now();
    this.sms.expires_at = Date.now() + 15 * 60 * 1000; // m /s /ms = 15 minutes
    // TODO:
  }
  next();
});

two_faSchema.pre("save", async function (next) {
  if (!this.isModified("sms.is_enabled") || this.isNew) return next();

  // Assign date of enabling OTP feature
  this.sms.is_changed_at = Date.now();
  next();
});

two_faSchema.pre("save", async function (next) {
  if (!this.isModified("sms.phone.is_verified") || this.isNew) return next();

  // Assign date of enabling sms feature
  this.sms.phone.verified_at = Date.now();
  next();
});

//--------------------------------------------------------

two_faSchema.pre("save", async function (next) {
  if (!this.isModified("question.is_enabled")) return next();

  this.question.is_changed_at = Date.now();
  next();
});

two_faSchema.pre("save", async function (next) {
  if (
    !(
      this.isModified("question.value") ||
      this.isModified("question.answer") ||
      this.isModified("question.hint")
    )
  )
    return next();

  this.question.modified_at = Date.now();
  next();
});
// ==================================================

// Let's export our created model
module.exports = two_faSchema;
