// #Let's catch our async errors
// By this function, we don't need to add try/ catch blocks in our route handlers/ controllers
// We just wrap our handlers/ controllers with this function!
// So, we can focus more on the business logic not the error handling.
module.exports = (ourHandler) => {
  return async (req, res, next) => {
    try {
      await ourHandler(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// NOTE: Instead of wrapping every route handler with this function and make our code not 
// easy to be read and more noisy, we can install a package "express-async-errors" and
// require it in our app.js file.