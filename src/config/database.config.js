// const https = require("https");
// const fs = require("fs");
const mongoose = require("mongoose");
const app = require("./../app");

// SSL certificate
// const private_key = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

module.exports = () => {
  app
    .listen(process.env.PORT || 8000, () => {
      mongoose
        .connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(() => {
          console.log(
            `Server is running on https://localhost:${process.env.PORT} (${process.env.NODE_ENV} environment)`
          );
        });
    });
};
