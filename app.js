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
app.use( // only removes ($ and .)
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      console.warn(`This request[${key}] is sanitized`, req);
    },
  })
);

//======================================================================

// My routes
app.use("/api/v1", userRoutes);
app.use("/api/v1/auth", authRoutes);

// Our error handling and logging middlewares| It has to be after all middlewares
app.use(logError);
app.use(otherErrorScenarios);
app.use(returnError);

//======================================================================

module.exports = app;
