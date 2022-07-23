const {
  // During setup:
  smsPage_during_setup_GET_service,
  generateSendSMS_POST_service,
  disableSMS_DELETE_service,
  verifySMS_duringSetup_GET_service,
  verifySMS_duringSetup_POST_service,
  resendSMS_during_setup_POST_service,

  // During login:
  generateSendSMS_duringLogin_GET_service,
  generateSendSMS_duringLogin_POST_service,
  verifySMS_duringLogin_GET_service,
  verifySMS_duringLogin_POST_service,
  resendSMS_during_login_POST_service,
} = require("../../../../services/auth/security_layers/sms/sms.services");

//====================================================================================

// During setup:
const smsPage_during_setup_GET_controller = (req, res, next) => {
  smsPage_during_setup_GET_service({ req, res, next });
};
const generateSendSMS_POST_controller = async (req, res, next) => {
  await generateSendSMS_POST_service({ req, res, next });
};
const disableSMS_DELETE_controller = async (req, res, next) => {
  await disableSMS_DELETE_service({ req, res, next });
};
const verifySMS_duringSetup_GET_controller = (req, res, next) => {
  verifySMS_duringSetup_GET_service({ req, res, next });
};
const verifySMS_duringSetup_POST_controller = async (req, res, next) => {
  await verifySMS_duringSetup_POST_service(req, res, next);
};
const resendSMS_during_setup_POST_controller = async (req, res, next) => {
  await resendSMS_during_setup_POST_service({ req, res, next });
};

// During login:
const generateSendSMS_duringLogin_GET_controller = (req, res, next) => {
  generateSendSMS_duringLogin_GET_service({ req, res, next });
};
const generateSendSMS_duringLogin_POST_controller = async (req, res, next) => {
  await generateSendSMS_duringLogin_POST_service({ req, res, next });
};
const verifySMS_duringLogin_GET_controller = (req, res, next) => {
  verifySMS_duringLogin_GET_service({ req, res, next });
};
const verifySMS_duringLogin_POST_controller = async (req, res, next) => {
  await verifySMS_duringLogin_POST_service({ req, res, next });
};
const resendSMS_during_login_POST_controller = async (req, res, next) => {
  await resendSMS_during_login_POST_service({ req, res, next });
};

module.exports = {
  smsPage_during_setup_GET_controller,
  generateSendSMS_POST_controller,
  disableSMS_DELETE_controller,
  verifySMS_duringSetup_GET_controller,
  verifySMS_duringSetup_POST_controller,
  resendSMS_during_setup_POST_controller,

  generateSendSMS_duringLogin_GET_controller,
  generateSendSMS_duringLogin_POST_controller,
  verifySMS_duringLogin_GET_controller,
  verifySMS_duringLogin_POST_controller,
  resendSMS_during_login_POST_controller,
};
