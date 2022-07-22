const {
  signup_GET_service,
  signup_POST_service,
} = require("../../../../services/auth/access/signup/signup.services");

const signUp_GET_controller = (req, res, next) => {
  signup_GET_service({ req, res, next });
};

const signUp_POST_controller = async (req, res, next) => {
  await signup_POST_service({ req, res, next });
};

module.exports = {
  signUp_GET_controller,
  signUp_POST_controller,
};
