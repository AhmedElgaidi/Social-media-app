const {
  verify_POST_service,
} = require("./../../../../services/auth/access/verify/verify.services");

const verify_POST_controller = async (req, res, next) => {
  await verify_POST_service({ req, res, next });
};

module.exports = {
  verify_POST_controller,
};
