const User = require("../models/user/User");
const { verify_access_token } = require("../helpers/tokens/accessToken");

const protect = async (req, res, next) => {
  // (1) Get access token
  const access_token =
    req.headers["x-access-token"] ||
    req.body.access_token ||
    req.query.access_token;

  // (2) Check for its existence in received request
  if (!access_token) {
    res.status(404).json({
      name: "Invalid Input",
      description: "Your access token is not found!!",
    });
  }

  // (3) verify access token
  const decodedAccessToken = await verify_access_token(access_token).catch(
    // Errors in the access token verification:
    (error) => {
      // (1) if user manipulated the token
      if (error.toString().includes("invalid signature")) {
        return res.status(422).json({
          name: "Invalid Token",
          description: "Sorry, your access token is manipulated!!",
        });
      }
      
      // (2) if access token is expired
      res.status(401).json({
        name: "Invalid Token",
        description:
          "Sorry, your access token is expired. Use your refresh token to get new tokens!!",
      });
    }
  );

  // If it reaches here, this means the token is valid and not expired, So

  // (4) Check if user really have this access token!
  await User.findById(decodedAccessToken._id)
    .select({
      "account.session": 1,
      "account.activation.is_account_active": 1,
      _id: 0,
    })
    .then((user) => {
      // (1) If user document is not found
      if (!user) {
        res.status(404).json({
          name: "Invalid Input",
          description:
            "Sorry, we couldn't find the associated account to this access token!!!",
        });
      }

      // (2) Check if access token is found or not in user document
      const isAccessTokenFound = user.account.session.find(
        (el) => el.tokens.access_token === access_token
      );

      // (3) If it's not found, then don't allow him to the next middleware!!
      if (!isAccessTokenFound) {
        return res.status(401).json({
          name: "Invalid Token",
          description:
            "Sorry, we couldn't find the access token associated to this account!!!",
        });
      }

      // (4) pass account active state to the next middleware
      req.is_account_active = user.account.activation.is_account_active;
    });

  // If it reaches here, then the access token is valid and not expired and found in the user document
  // and we can now let the request move to the next middleware!!

  // (5) Assign the user id the request pipeline
  req.userId = decodedAccessToken._id;

  // (6) pass access token to the request, so we can revoke it when we want
  req.access_token = access_token;

  next();
};

module.exports = protect;
