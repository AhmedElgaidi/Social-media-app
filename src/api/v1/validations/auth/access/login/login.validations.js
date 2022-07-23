const {
  login_GET_service,
  login_POST_service,
} = require("../../../../services/auth/access/login/login.services");

//==============================================================

const login_GET_controller = (req, res, next) => {
  login_GET_service({ req, res, next });
};

const login_POST_controller = async (req, res, next) => {
  await login_POST_service({ req, res, next });
};

module.exports = {
  login_GET_controller,
  login_POST_controller,
};
