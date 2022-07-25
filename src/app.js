require("express-async-errors");
const express = require('express')
const routes_middleware = require("./api/v1/middlewares/auth.routes.middleware");
const third_party_middleware = require("./api/v1/middlewares/third.party.middleware");
const errors_middleware = require("./api/v1/middlewares/errors.middleware");

//==========================================
const app = express();

// Application middlewares
third_party_middleware({express,app});

routes_middleware(app);

errors_middleware(app);

module.exports = app;
