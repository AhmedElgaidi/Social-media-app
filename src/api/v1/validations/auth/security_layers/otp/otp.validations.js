const {
  generateSendOTP_GET_service,
  generateSendOTP_POST_service,
  disableOTP_DELETE_service,
  verifyOTP_GET_service,
  verifyOTP_POST_service,
  re_generate_send_OTP_POST_service,
} = require("../../../../services/auth/security_layers/otp/otp.services");

//================================================================================

const generateSendOTP_GET_controller = (req, res, next) => {
  generateSendOTP_GET_service({ req, res, next });
};

const generateSendOTP_POST_controller = async (req, res, next) => {
  await generateSendOTP_POST_service({ req, res, next });
};

const disableOTP_DELETE_controller = async (req, res, next) => {
  await disableOTP_DELETE_service({ req, res, next });
};

const verifyOTP_GET_controller = (req, res, next) => {
  verifyOTP_GET_service({ req, res, next });
};

const verifyOTP_POST_controller = async (req, res, next) => {
  await verifyOTP_POST_service({ req, res, next });
};

const re_generate_send_OTP_POST_controller = async (req, res, next) => {
  await re_generate_send_OTP_POST_service({ req, res, next });
};

//================================================================================

module.exports = {
  generateSendOTP_GET_controller,
  generateSendOTP_POST_controller,
  disableOTP_DELETE_controller,
  verifyOTP_GET_controller,
  verifyOTP_POST_controller,
  re_generate_send_OTP_POST_controller,
};
