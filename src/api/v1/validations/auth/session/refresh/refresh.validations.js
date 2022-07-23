const {
  refreshToken_POST_service,
} = require("../../../../services/auth/session/refresh/refresh.services");

// ===============================

const refreshToken_POST_controller = async (req, res, next) => {
  await refreshToken_POST_service({ req, res, next });
};

module.exports = {
  refreshToken_POST_controller,
};
