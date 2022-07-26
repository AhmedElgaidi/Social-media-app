const User = require("./../../../../models/user/User");

// =============================================================

const deleteAccount_DELETE_service = async ({ req, res, next }) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Delete user document from DB
  await User.deleteOne({ id: userId });

  // (3) Inform front-end with the status
  res.status(200).json({
    status: "Success",
    message: "Your account is deleted permanently successfully!!!",
  });
};

module.exports = { deleteAccount_DELETE_service };
