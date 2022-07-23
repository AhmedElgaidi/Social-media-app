const {
  all2faMethods_GET_service,
  generateSecretTOTP_POST_service,
  disableTOTP_DELETE_service,
  scanTOTP_qrCode_GET_service,
  VerifyTOTP_during_setup_GET_service,
  verifyTOTP_during_setup_POST_service,
  verifyTOTP_during_login_GET_service,
  verifyTOTP_during_login_POST_service,
} = require("../../../../services/auth/security_layers/totp/totp.services");

// ===================================================================

const all2faMethods_GET_controller = async (req, res, next) => {
  await all2faMethods_GET_service({ req, res, next });
};

const generateSecretTOTP_POST_controller = async (req, res, next) => {
  await generateSecretTOTP_POST_service({ req, res, next });
};

const disableTOTP_DELETE_controller = async (req, res, next) => {
  await disableTOTP_DELETE_service({ req, res, next });
};

const scanTOTP_qrCode_GET_controller = async (req, res, next) => {
  await scanTOTP_qrCode_GET_service({ req, res, next });
};

const totpVerify_GET_controller = async (req, res, next) => {
  await VerifyTOTP_during_setup_GET_service({ req, res, next });
};

const verifyTOTP_during_setup_POST_controller = async (req, res, next) => {
  await verifyTOTP_during_setup_POST_service({ req, res, next });
};

const verifyTOTP_during_login_GET_controller = async (req, res, next) => {
  await verifyTOTP_during_login_GET_service({ req, res, next });
};

const verifyTOTP_during_login_POST_controller = async (req, res, next) => {
  await verifyTOTP_during_login_POST_service({ req, res, next });
};

//=====================================================================
module.exports = {
  all2faMethods_GET_controller,
  generateSecretTOTP_POST_controller,
  disableTOTP_DELETE_controller,
  scanTOTP_qrCode_GET_controller,
  totpVerify_GET_controller,
  verifyTOTP_during_setup_POST_controller,
  verifyTOTP_during_login_GET_controller,
  verifyTOTP_during_login_POST_controller,
};
