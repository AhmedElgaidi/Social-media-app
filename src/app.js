// Our imports
// (1) Core modules

// (2) 3rd party modules
require("express-async-errors");
const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");

// (3) custom modules
// const auth_routes = require("./api/v1/routes/index");

// (1) Access routes
const signup_routes = require("./api/v1/routes/auth/access/signup/signup.routes");
const verify_routes = require("./api/v1/routes/auth/access/verify/verify.routes");
const login_routes = require("./api/v1/routes/auth/access/login/login.routes");
const logout_routes = require("./api/v1/routes/auth/access/logout/logout.routes");

// (2) Status routes
const activate_routes = require("./api/v1/routes/auth/status/activate/activate.routes");
const deactivate_routes = require("./api/v1/routes/auth/status/deactivate/deactivate.routes");
const delete_routes = require("./api/v1/routes/auth/status/delete/delete.routes");

// (3) Password
const changePassword_routes = require("./api/v1/routes/auth/password/change/change.routes");
const forgetPassword_routes = require("./api/v1/routes/auth/password/forget/forget.routes");
const resetPassword_routes = require("./api/v1/routes/auth/password/reset/reset.routes");

// (4) Session
const sessions_routes = require("./api/v1/routes/auth/session/sessions/sessions.routes");
const revokeTokens_routes = require("./api/v1/routes/auth/session/revoke/revoke.routes");
const refreshToken_routes = require("./api/v1/routes/auth/session/refresh/refresh.routes");

// (5) 2FA
const totp_routes = require("./api/v1/routes/auth/security_layers/totp/totp.routes");
const otp_routes = require("./api/v1/routes/auth/security_layers/otp/otp.routes");
const sms_routes = require("./api/v1/routes/auth/security_layers/sms/sms.routes");
const question_routes = require("./api/v1/routes/auth/security_layers/question/question.routes");

const { logError, returnError } = require("./api/v1/errors/errorHandler");
const otherErrorScenarios = require("./api/v1/errors/otherErrorScenarios");

//======================================================================

// Let's create our express app instance
const app = express();
//======================================================================

// ===============================
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
// app.use("/api/v1/auth", auth_routes);
const auth_routes_middleware = () => {
  app.use(
    "/api/v1/auth",
    // (1) Access routes
    [signup_routes, verify_routes, login_routes, logout_routes],
    // (2) Status routes
    [activate_routes, deactivate_routes, delete_routes],
    // (3) Passwords routes
    [changePassword_routes, forgetPassword_routes, resetPassword_routes],
    // (4) Session routes
    [sessions_routes, revokeTokens_routes, refreshToken_routes]
  );

  // Security layer (2FA)
  app.use("/api/v1/auth/2fa", [
    totp_routes, // Layer (1)
    otp_routes, // Layer (2)
    sms_routes, // Layer (3)
    // Layer (4)
  ]);
};

auth_routes_middleware();
// app.use("/api/v1", userRoutes);

// 404 handler
app.all("*", (req, res, next) => {
  // for all HTTP methods and unhandled routes
  res.status(404).json({
    status: "Failed",
    message: `Sorry, we can't find "${req.originalUrl}" among our server routes`,
  });
  next();
});

// Our combined error handling and logging middleware
// [Note]: It has to be after all middlewares

app.use([logError, otherErrorScenarios, returnError]);
//======================================================================

module.exports = app;

// TODO: Rate limit
