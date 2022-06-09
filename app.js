// Our imports
// (1) Core modules

// (2) 3rd party modules
const express = require("express");
// var bodyParser = require("body-parser");

// (3) custom modules
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

//======================================================================

// Let's create our express app instance
const app = express();
//======================================================================

// My Middlewares

// for parsing application/json
app.use(express.json({ limit: '20mb' }));

// My routes
app.use("/api/v1", userRoutes);
app.use("/api/v1/auth", authRoutes);

//======================================================================

module.exports = app;
