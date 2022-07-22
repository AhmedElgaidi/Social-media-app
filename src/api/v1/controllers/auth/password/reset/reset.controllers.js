const {
  resetPassword_GET_service,
  resetPassword_POST_service,
} = require("./../../../../services/auth/password/reset/reset.services");

const resetPassword_GET_controller = (req, res, next) => {
  resetPassword_GET_service({ req, res, next });
};

const resetPassword_POST_controller = async (req, res, next) => {
  await resetPassword_POST_service({ req, res, next });
};

module.exports = {
  resetPassword_GET_controller,
  resetPassword_POST_controller,
};
