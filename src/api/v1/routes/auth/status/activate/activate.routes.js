const express = require("express");

const {
  activateAccount_POST_controller,
} = require("./../../../../controllers/auth/status/activate/activate.controllers");

//========================================

const router = express.Router();

router.route("/activate-account/:token").post(activateAccount_POST_controller);

module.exports = router;
