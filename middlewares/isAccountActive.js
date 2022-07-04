const User = require("../models/user/User");

// this token should be after protect middleware, as it depends on it!!!
const is_account_active = async (req, res, next) => {
    // (1) Get is_account_active from protect middleware
    const is_account_active = req.is_account_active;

    // (2) Check if it's deactivated
    if(!is_account_active) {
        res.status(401).json({
            name: "Deactivated Account",
            description: "Sorry, your account is deactivated."
        });
    }

  next();
};

module.exports = is_account_active;
