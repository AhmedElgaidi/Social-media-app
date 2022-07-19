// Our imports
// (1) Core modules

// (2) 3rd party modules
require("express-async-errors");
const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");

// (3) custom modules
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const { logError, returnError } = require("./errors/errorHandler");
const otherErrorScenarios = require("./errors/otherErrorScenarios");

//======================================================================

// Let's create our express app instance
const app = express();
//======================================================================

// My Middlewares

// for parsing application/json
app.use(express.json({ limit: "20mb" }));

// For sanitizing user-supplied data to prevent MongoDB Operator Injection
app.use(
  // only removes ($ and .)
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      console.warn(`This request[${key}] is sanitized`, req);
    },
  })
);

//======================================================================
// My routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", userRoutes);

// 404 handler
app.all("*", (req, res, next) => {
  // for all HTTP methods and unhandled routes
  res.status(404).json({
    status: "Failed",
    message: `Sorry, we can't find "${req.originalUrl}" among our server routes`,
  });
  next();
});

// Our error handling and logging middlewares| It has to be after all middlewares
app.use(logError);
app.use(otherErrorScenarios);
app.use(returnError);

//======================================================================

module.exports = app;

// TODO: Rate limit
// TODO: Don't let fake ips to access api
// TODO: Cast error: user ID length has to be 24 chars, if not then error message.
