// Our imports
const User = require("../../models/User");

//======================================================================

const createUser_POST = async (req, res, next) => {
  const user = await User.create({ user_info: req.body });
  console.log("Created successfully");
  console.log('User created', user);
  return res.send({
    message: "created successfully",
    user
  });
};

//======================================================================
// Export our controllers
module.exports = {
  createUser_POST,
};
