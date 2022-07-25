const mongoSanitize = require("express-mongo-sanitize");
const toobusy = require("toobusy-js");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");

//===================================================

module.exports = third_party_middleware = ({ express, app }) => {
  // Enable CORS
  app.use(cors());

  // for parsing application/json (Set request size limits)
  // By default, the size limit is 100kb
  app.use(express.json({ limit: "2mb" }));

  // For sanitizing user-supplied data to prevent MongoDB Operator Injection
  app.use(
    // only removes ($ and .)
    mongoSanitize({
      onSanitize: ({ req, key }) => {
        console.warn(`This request[${key}] is sanitized`, req);
      },
    })
  );

  // Monitor event loop (Under heavy traffic => DoS attack)
  app.use((req, res, next) => {
    if (toobusy()) {
      return res
        .status(503)
        .send("Sorry, we can't proceed. The server is too busy right now");
    } else {
      next();
    }
  });

  // Rate limit
  const limiter = rateLimit({
    // let every certain ip to send only 100 request in 10 minutes
    max: 100, // 100 request
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: "Too many requests from your IP. Please try again in an hour!",
  });
  app.use(limiter);

  // Prevent HTTP parameter pollution
  app.use(hpp());

  // Set appropriate security headers
  app.use(helmet());

  // Data sanitization against XSS attacks (Sanitize req.body, req.params, req.query)
  app.use(xss());

  // Compress responses
  const shouldCompress = (req, res) => {
    if (req.headers["x-no-compression"]) {
      // don't compress responses with this request header
      return false;
    }

    // fallback to standard filter function
    return compression.filter(req, res);
  };
  app.use(compression({ filter: shouldCompress }));

  // Reduce Fingerprinting
  app.disable("x-powered-by");
};
