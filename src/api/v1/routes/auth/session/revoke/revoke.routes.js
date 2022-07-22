const express = require("express");

const protect = require('./../../../../middlewares/protect')

const is_account_active = require('./../../../../middlewares/isAccountActive');

const {
    revokeSession_DELETE_controller,
} = require("./../../../../controllers/auth/session/revoke/revoke.controllers");

//========================================

const router = express.Router();

router
  .route("/delete-session")
  .delete(protect, is_account_active, revokeSession_DELETE_controller);

  module.exports = router;
