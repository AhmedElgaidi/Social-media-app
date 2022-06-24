const mongoose = require("mongoose");

// ================================================
const Schema = mongoose.Schema;

const userInfoSchema = new Schema({
  _id: false, // To prevent creating id field for sub-documents
  name: {
    first: {
      type: String,
      required: [true, "Please, provide us with your own first name!"],
      minlength: [
        3,
        "Please, provide us with a longer first name (3-10 characters) ",
      ],
      maxlength: [
        10,
        "Please, provide us with a shorter first name (3-10 characters) ",
      ],
      trim: true,
      validate: {
        // to remove any special chars
        validator: function (str) {
          const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
          return !specialChars.test(str);
        },
        message:
          "Please, don't send malicious data and try to be decent user!1",
      },
    },
    last: {
      type: String,
      required: [true, "Please, provide us with your own last name!"],
      minlength: [
        3,
        "Please, provide us with a longer last name (3-10 characters) ",
      ],
      maxlength: [
        10,
        "Please, provide us with a shorter last name (3-10 characters) ",
      ],
      trim: true,
      validate: {
        // to remove any special chars
        validator: function (str) {
          const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
          return !specialChars.test(str);
        },
        message:
          "Please, don't send malicious data and try to be decent user!2",
      },
    },
  },
  user_name: {
    type: String,
    index: true,
    unique: [true, "Please, provide us with a unique user name!"],
    required: [true, "Please, provide us with a valid user name!"],
    trim: true,
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!3",
    },
  },
  age: {
    type: Number,
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!4",
    },
  },
  bio: {
    type: String,
    maxLength: [300, "Please, make your bio shorter! (<=300 chars)"],
    trim: true,
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!5",
    },
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message: "Sorry, your data is not accepted!6",
    },
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!7",
    },
  },
  language: {
    type: String,
    trim: true,
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!8",
    },
  },
  avatar: {
    type: String,
    trim: true,
    default: "https://www.abc.com",
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};'"\\|,<>\?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!9",
    },
  },
  background_image: {
    type: String,
    trim: true,
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!10",
    },
  },
  city: {
    type: String,
    trim: true,
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!11",
    },
  },
  relationship_status: {
    type: String,
    enum: {
      values: ["single", "married"],
      message: "Sorry, your data is not accepted!",
    },
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!12",
    },
  },
  work_status: {
    type: String,
    enum: {
      values: ["employed", "Unemployed"],
      message: "Sorry, your data is not accepted!",
    },
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!13",
    },
  },
  field_of_study: {
    type: String,
    trim: true,
    validate: {
      // to remove any special chars
      validator: function (str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return !specialChars.test(str);
      },
      message: "Please, don't send malicious data and try to be decent user!14",
    },
  },
});

// ==================================================
// Let's export our created model
module.exports = userInfoSchema;
