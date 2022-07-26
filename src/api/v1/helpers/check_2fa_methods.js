module.exports = async ({ res, user }) => {
  // (1) If TOTP is enabled
  const is_totp_enabled = user.account.two_fa.totp.is_enabled;

  if (is_totp_enabled) {
    return res.status(301).redirect("/api/v1/auth/2fa/totp/verify-during-login/" + user.id);
  }

  // (2) If OTP is enabled
  const is_otp_enabled = user.account.two_fa.otp.is_enabled;

  if (is_otp_enabled) {
    return res.status(301).redirect("/api/v1/auth/2fa/otp/verify/" + user.id);
  }

  // (3) If SMS is enabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  if (is_sms_enabled) {
    return res.status(301).redirect("/api/v1/auth/2fa/sms");
  }

  // (4) If Security Question is enabled
  const is_security_question_enabled = user.account.two_fa.question.is_enabled;

  if (is_security_question_enabled) {
    return res
      .status(301)
      .redirect("/api/v1/auth/2fa/security-question/verify/" + user.id);
  }
};
