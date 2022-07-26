const mongoose = require("mongoose");
const app = require("./../app");

module.exports = () => {
  app.listen(process.env.PORT || 8000, () => {
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
