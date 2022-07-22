const express = require("express");

const protect = require('./../../../../middlewares/protect')

const is_account_active = require('./../../../../middlewares/isAccountActive');

const {
    sessions_GET_controller,
} = require("./../../../../controllers/auth/session/sessions/sessions.controllers");

//========================================

const router = express.Router();

router
  .route("/sessions")
  .get(protect, is_account_active, sessions_GET_controller);

  module.exports = router;
