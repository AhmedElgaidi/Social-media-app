const {
  generateTrustedEmail_GET_service,
  generateTrustedEmail_POST_service,
  disableTrustedEmail_DELETE_service,
  verifyEnableTrustedEmail_GET_service,
  sendEmail_during_recovery_GET_service,
  sendEmail_during_recovery_POST_servicer,
  verify_during_recovery_GET_service,
} = require("../../../../services/auth/recovery/trusted_email/trusted_email.services");

//======================================================================
// During Setup:
const generateTrustedEmail_GET_controller = async (req, res, next) => {
  await generateTrustedEmail_GET_service({ req, res, next });
};

const generateTrustedEmail_POST_controller = async (req, res, next) => {
  await generateTrustedEmail_POST_service({ req, res, next });
};

const disableTrustedEmail_DELETE_controller = async (req, res, next) => {
  await disableTrustedEmail_DELETE_service({ req, res, next });
};

const verifyEnableTrustedEmail_GET_controller = async (req, res, next) => {
  await verifyEnableTrustedEmail_GET_service({ req, res, next });
};

// During recovery
const sendEmail_during_recovery_GET_controller = (req, res, next) => {
  sendEmail_during_recovery_GET_service({ req, res, next });
};

const sendEmail_during_recovery_POST_controller = async (req, res, next) => {
  await sendEmail_during_recovery_POST_servicer({ req, res, next });
};

const verify_during_recovery_GET_controller = async (req, res, next) => {
  await verify_during_recovery_GET_service({ req, res, next });
};

module.exports = {
  generateTrustedEmail_GET_controller,
  generateTrustedEmail_POST_controller,
  disableTrustedEmail_DELETE_controller,
  verifyEnableTrustedEmail_GET_controller,
  sendEmail_during_recovery_GET_controller,
  sendEmail_during_recovery_POST_controller,
  verify_during_recovery_GET_controller,
};
