const {
  forgetPassword_GET_service,
  forgetPassword_POST_service,
} = require("../../../../services/auth/password/forget/forget.services");

//======================================================================

const forgetPassword_GET_controller = (req, res, next) => {
  forgetPassword_GET_service({ req, res, next });
};

const forgetPassword_POST_controller = async (req, res, next) => {
  await forgetPassword_POST_service({ req, res, next });
};

module.exports = {
  forgetPassword_GET_controller,
  forgetPassword_POST_controller,
};
