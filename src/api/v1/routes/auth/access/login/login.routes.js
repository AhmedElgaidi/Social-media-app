const express = require("express");

const getDeviceInfo = require("./../../../../middlewares/getDeviceInfo");

const {
  login_GET_controller,
  login_POST_controller,
} = require("./../../../../controllers/auth/access/login/login.controllers");

//========================================

const router = express.Router();

router
  .route("/login")
  .get(login_GET_controller)
  .post(getDeviceInfo, login_POST_controller);

module.exports = router;
