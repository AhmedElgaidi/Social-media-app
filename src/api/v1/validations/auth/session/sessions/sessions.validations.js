const {
  sessions_GET_service,
} = require("../../../../services/auth/session/sessions/sessions.services");

const sessions_GET_controller = async (req, res, next) => {
  await sessions_GET_service({ req, res, next });
};

module.exports = {
  sessions_GET_controller,
};
