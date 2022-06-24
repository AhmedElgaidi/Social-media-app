const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");

// ================================================
const Schema = mongoose.Schema;

const schemaOptions = {
  // let's add some options to user schema
  timestamps: true, // To add createdAt and updatedAt fields
  minimize: false, // Don't store fields if it's empty
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
    info: {
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
            // to remove any special char as well as white spaces and tabs
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
            // to remove any special char as well as white spaces and tabs
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
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!3",
        },
      },
      age: {
        type: Number,
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!4",
        },
      },
      bio: {
        type: String,
        maxLength: [300, "Please, make your bio shorter! (<=300 chars)"],
        trim: true,
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!5",
        },
      },
      gender: {
        type: String,
        enum: {
          values: ["male", "female"],
          message: "Sorry, your data is not accepted!6",
        },
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!7",
        },
      },
      language: {
        type: String,
        trim: true,
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!8",
        },
      },
      avatar: {
        type: String,
        trim: true,
        default: "https://www.abc.com",
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};'"\\|,<>\?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!9",
        },
      },
      background_image: {
        type: String,
        trim: true,
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!10",
        },
      },
      city: {
        type: String,
        trim: true,
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!11",
        },
      },
      relationship_status: {
        type: String,
        enum: {
          values: ["single", "married"],
          message: "Sorry, your data is not accepted!",
        },
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!12",
        },
      },
      work_status: {
        type: String,
        enum: {
          values: ["employed", "Unemployed"],
          message: "Sorry, your data is not accepted!",
        },
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!13",
        },
      },
      field_of_study: {
        type: String,
        trim: true,
        validate: {
          // to remove any special char as well as white spaces and tabs
          validator: function (str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return !specialChars.test(str);
          },
          message:
            "Please, don't send malicious data and try to be decent user!14",
        },
      },
      account: {
        password: {
          type: String,
          trim: true,
          select: false,
        },
        tokens_list: [
          {
            access_token: {
              type: String,
              is_Active: {
                type: Boolean,
                default: true,
              },
            },
            refresh_token: {
              type: String,
              is_Active: {
                type: Boolean,
                default: true,
              },
            },
            device_info: {},
          },
        ],
      },
      email_list: [
        {
          _id: false, // To prevent creating id field for sub-documents
          email: {
            type: String,
            unique: [true, "Please, provide us with your own email!"],
            required: [true, "Please, provide us with your email!"],
            lowercase: true,
            trim: true,
            validate: [
              validator.isEmail,
              "Please, provide us with a valid email!",
            ],
            validate: {
              // to remove any special char as well as white spaces and tabs
              validator: function (str) {
                const specialChars = /[`!#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/;
                return !specialChars.test(str);
              },
              message:
                "Please, don't send malicious data and try to be decent user!15",
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
        },
      ],
    },
  },
  schemaOptions
);

// =================================================
// Our hooks (middlewares)

// =================================================
// Our methods
userSchema.methods.generateAndSignAccessAndRefreshTokens = function () {
  // (1) Generate access token
  const access_token = jwt.sign(
    { _id: this.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );

  // (2) Generate refresh token
  const refresh_token = jwt.sign(this.id, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  // (3) Assign tokens to user document
  this.account.tokens_list.push({
    access_token,
    refresh_token,
  });
  console.log(this);
};

// ==================================================
// Let's export our created model
module.exports = mongoose.model("User", userSchema);
