const User = require("./../../../../models/user/User");

//===========================================================================

const deactivateAccount_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.activation.is_account_active": 1,
  });

  // (3) check if it's already deactivated
  // I don't need this as i've put the is_account_active middleware before this controller!!!

  // (4) Update user document
  user.account.activation.is_account_active = false;

  // (5) Save updated user document
  await user.save();

  // (6) Inform front-end about the status
  res.status(200).json({
    status: "Success",
    message: "Your account is deactivated successfully!!!",
  });
};

module.exports = {
  deactivateAccount_POST_service,
};
