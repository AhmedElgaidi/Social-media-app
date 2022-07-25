const { logError, returnError } = require("./../errors/errorHandler");
const otherErrorScenarios = require("./../errors/otherErrorScenarios");

//==================================================================

module.exports = (app) => {
  app.use([logError, otherErrorScenarios, returnError]);
};
