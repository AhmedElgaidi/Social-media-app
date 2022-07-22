const express = require("express");

const getDeviceInfo = require('./../../../../middlewares/getDeviceInfo')

const {
    refreshToken_POST_controller,
} = require("./../../../../controllers/auth/session/refresh/refresh.controllers");

//========================================

const router = express.Router();

router.route("/refresh").post(getDeviceInfo, refreshToken_POST_controller);



  module.exports = router;
