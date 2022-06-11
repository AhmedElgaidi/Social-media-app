const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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
          trim: true,
        },
        last: {
          type: String,
          trim: true,
        },
      },
      user_name: {
        type: String,
        index: true,
        unique: [true, "Sorry, It's already taken!"],
        required: [true, "Please, provide us with your username!"],
        trim: true,
      },
      age: {
        type: Number,
      },
      bio: {
        type: String,
        trim: true,
        maxLength: [300, "Please, make your bio shorter! (<=300 chars)"],
      },
      gender: {
        type: String,
        enum: {
          values: ["male", "female"],
          message: "Sorry, your data is not accepted!",
        },
      },
      language: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
        trim: true,
        default: "https://www.sdfsd.com",
      },
      background_image: { type: String, trim: true },
      city: { type: String, trim: true },
      relationship_status: {
        type: String,
        enum: {
          values: ["single", "married"],
          message: "Sorry, your data is not accepted!",
        },
      },
      work_status: {
        type: String,
        enum: {
          values: ["employed", "Unemployed"],
          message: "Sorry, your data is not accepted!",
        },
      },
      field_of_study: {
        type: String,
        trim: true,
      },
    },
    account: {
      password: {
        type: String,
        trim: true,
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
          trim: true,
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
