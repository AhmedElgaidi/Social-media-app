const DeviceDetector = require("node-device-detector");
const ClientHints = require("node-device-detector/client-hints");

const deviceDetector = new DeviceDetector();
const clientHints = new ClientHints();

const getDeviceInfo = (req, res, next) => {
  const useragent = req.headers["user-agent"];
  const clientHintsData = clientHints.parse(res.headers);

  req.useragent = useragent;
  req.device = deviceDetector.detect(useragent, clientHintsData);
  req.bot = deviceDetector.parseBot(useragent);

  next();
};

module.exports = getDeviceInfo;
