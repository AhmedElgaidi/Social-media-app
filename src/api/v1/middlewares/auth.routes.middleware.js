// (1) Access routes
const signup_routes = require("./../routes/auth/access/signup/signup.routes");
const verify_routes = require("./../routes/auth/access/verify/verify.routes");
const login_routes = require("./../routes/auth/access/login/login.routes");
const logout_routes = require("./../routes/auth/access/logout/logout.routes");

// (2) Status routes
const activate_routes = require("./../routes/auth/status/activate/activate.routes");
const deactivate_routes = require("./../routes/auth/status/deactivate/deactivate.routes");
const delete_routes = require("./../routes/auth/status/delete/delete.routes");

// (3) Password
const changePassword_routes = require("./../routes/auth/password/change/change.routes");
const forgetPassword_routes = require("./../routes/auth/password/forget/forget.routes");
const resetPassword_routes = require("./../routes/auth/password/reset/reset.routes");

// (4) Session
const sessions_routes = require("./../routes/auth/session/sessions/sessions.routes");
const revokeTokens_routes = require("./../routes/auth/session/revoke/revoke.routes");
const refreshToken_routes = require("./../routes/auth/session/refresh/refresh.routes");

// (5) 2FA
const totp_routes = require("./../routes/auth/security_layers/totp/totp.routes");
const otp_routes = require("./../routes/auth/security_layers/otp/otp.routes");
const sms_routes = require("./../routes/auth/security_layers/sms/sms.routes");
const question_routes = require("./../routes/auth/security_layers/question/question.routes");

// (6) Recovery options
const backupCodes_routes = require("./../routes/auth/recovery/backup_codes/backup_codes.routes");
const trustedEmail_routes = require("./../routes/auth/recovery/trusted_email/trusted_email.routes");

module.exports = routes_middleware = (app) => {
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
    question_routes, // Layer (4)
  ]);

  // Recovery options
  app.use("/api/v1/auth/account-recovery", [
    backupCodes_routes,
    trustedEmail_routes,
  ]);

  // Home route
  app.use("/", (req, res, next) => {
    res.status(200).json({
      message: "Welcome to my social media API.",
      description:
        "This is an advanced authentication API with many security features.",
      creator: {
        name: "Ahmed Elgaidi",
        contacts: {
          linkedin: "www.linkedin.com/in/ahmedelgaidi",
          github: "https://github.com/AhmedElgaidi",
        },
      },
      API: {
        source_code: "https://github.com/AhmedElgaidi/Social-media-app",
        API_documentation:
          "https://documenter.getpostman.com/view/8694181/UzXM1yep#c559612b-3c64-481a-a03f-c7b7560646ee",
      },
    });
  });

  // 404 handler
  app.all("*", (req, res, next) => {
    // for all HTTP methods and unhandled routes
    res.status(404).json({
      status: "Failed",
      message: `Sorry, we can't find "${req.originalUrl}" among our server routes`,
    });
  });
};
