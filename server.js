// [NOTE]: This file would be for anything not related to express app

// Our modules
require("dotenv").config({ path: "./config.env" }); // to import our variables
const app = require("./app");
const mongoose = require("mongoose");

//================================================================================================

const server = app.listen(process.env.PORT || 8000, () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(
        `Server is running on https://localhost:${process.env.PORT} (${process.env.NODE_ENV} environment)`
      );
    })
    .catch((error) =>
      console.log(`Failed to connect to mongoDB \nError: ${error}`)
    );
});

//================================================================================================

// let's handle our unhandled promise rejection (globally) by using event listeners
// But, we don't rely on them, we have to add our catch blocks whenever we need.
process.on("unhandledRejection", (err) => {
  // Now ,we are handling all the rejection resulted from our promises
  console.error(err.name, err.message);
  server.close(() => {
    console.log("Unhandled rejections, shutting down....");
    process.exit(1);
  });
});

// Let's handle our uncaught exceptions
process.on("uncaughtException", (err) => {
  // Now ,we are handling all the rejection resulted from our promises
  console.error(err.name, err.message);
  server.close(() => {
    console.log("Uncaught exceptions, shutting down....");
    process.exit(1);
  });
});

// on production (heroku) the dyno restarts every 24 hours to keep our server healthy and active
// so what if we have some requests during this time? they will be hanging, and of course we don't
// want to have that
process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});
