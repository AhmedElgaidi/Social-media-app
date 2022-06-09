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
        }
      },
      user_name: {
        type: String,
        index: true,
        // unique: [true, "Sorry, It's already taken!"],
        // required: [true, "Please, provide us with your username!"],
        trim: true,
      },
      email_list: [
        {
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
        }
      ],
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
    },
  },
  schemaOptions
);

// ==================================================
// Let's export our created model
module.exports = mongoose.model("User", userSchema);
