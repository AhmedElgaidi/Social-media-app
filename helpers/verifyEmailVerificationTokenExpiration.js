const jwt = require('jsonwebtoken');


const verifyEmailVerificationTokenExpiration = async token => {
    let isExpired = false;

    await jwt.verify(
      token,
      process.env.EMAIL_VERIFICATION_TOKEN_SECRET,
      (error, decodedToken) => {
        // if(error) console.log(error);
        if (decodedToken) {
          if (decodedToken.exp < new Date().getTime() / 1000) isExpired = true;
        }
      }
    );

    return isExpired;
};

module.exports = verifyEmailVerificationTokenExpiration;