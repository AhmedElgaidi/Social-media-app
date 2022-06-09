// Our imports
// (1) Core modules

// (2) 3rd party modules
const express = require("express");
// var bodyParser = require("body-parser");

// (3) custom modules
const userRoutes = require("./routes/user/user.routes");

//======================================================================

// Let's create our express app instance
const app = express();
//======================================================================

// My Middlewares

// for parsing application/json
app.use(express.json({ limit: '20mb' }));

// My routes
app.use("/api/v1/users/", userRoutes);

//======================================================================

module.exports = app;
