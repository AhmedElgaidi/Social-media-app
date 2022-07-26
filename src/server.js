// [NOTE]: This file would be for anything not related to express app

// Our modules
require("dotenv").config({ path: "config.env" }); // to import our variables

const connect_to_MongoDB = require("./config/database.config");

const {
  logError,
  isOperationalError,
} = require(`./api/v1/errors/errorHandler`);

//================================================================================================
// Connect to MongoDB server
connect_to_MongoDB();

//================================================================================================
// let's handle our unhandled promise rejection (globally) by using event listeners
// But, we don't rely on them, we have to add our catch blocks whenever we need.
// Let's
process.on("unhandledRejection", (error) => {
  // Now ,we are handling all the rejection resulted from our promises (async code)
  // like connecting to DB, remote server/ service, etc...
  throw error;
});

// Let's handle our uncaught exceptions
process.on("uncaughtException", (error) => {
  // Now ,we are handling all the rejection resulted from our synchronous code.
  // This an exception that thrown somewhere (not express, the express pipeline)
  // as we already handled it in our error handler
  logError(error);
  if (!isOperationalError(error)) {
    process.exit(1);
  }
});

// on production (heroku) the dyno restarts every 24 hours to keep our server healthy and active
// so what if we have some requests during this time? they will be hanging, and of course we don't
// want to have that
process.on("SIGTERM", () => {
  logError(error);
  if (!isOperationalError(error)) {
    process.exit(1);
  }
});
