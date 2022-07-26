
# Authenticating API
![A screenshot for the project](https://raw.githubusercontent.com/AhmedElgaidi/Social-media-app/main/public/sreenshot.png)

### Project Links:
- [Live API on Heroku](https://social-app-260.herokuapp.com/)
- [API postman documentation](https://documenter.getpostman.com/view/8694181/UzXM1yep)


### Personal project goals:
- Learn how to document a project (e.g. API).
- Learn how to structure/ organize a large scale project.
- Learn more about the security measures and options that should be found in any modern API.


### Project Features (In Short):
1) Sign Up (Create new account).
2) Log In (Get access and refresh tokens).
3) Verify Account (verify email).
3) Log Out (invalidate tokens).
4) Activate Account.
5) Deactivate Account.
6) Delete Account.
7) Change Password.
8) Forget Password.
9) Reset Password.
10) Update session tokens (refresh token = new access token + new refresh token).
11) Get all active sessions (Every session = access token + refresh token + device information).
12) Enable/ disable TOTP as 2FA.
13) Enable/ disable OTP as 2FA.
14) Resend OTP.
15) Enable/ disable SMS as 2FA.
16) Resend SMS.
17) Enable/ disable security question.
18) Update/ change security question.
19) Enable/ disable backup codes as account recovery method.
20) Enable/ disable trusted (secondary) email as account recovery method.

### Project Features (In details):
#### 1) sign Up
- **For:** It's for creating a new account.
- **Requirments:** first name, last name, user name, email, password, confirm password fields.
- **Result:** Create a new user document in our DB.

#### 2) Verify Account:
- **For:** It's for verifing the given email before any further processes.
- **Requirments:** Just a valid email to recieve email in it's mailbox.
- **Result:** User recieves email verification account.

#### 3) Login Account: (Note: User can create as many session as he wants and can control them all in an easy way)
- **For:** After user verifies his given email, we redirect him to the login page, so he can get a sesion (access + refresh token).
- **Requirments:** Just email and password.
- **Result:** User gets access token (valid for 15min.) and refresh token (valid for 1 day) to access any private endpoint.

#### 4) Logout:
- **For:** The user can log out from our system whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** We invalidates the session tokens.

#### 5) Deactivate Account:
- **For:** The user can deactivate his account as much as he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** He access our private resources anymore (he needs to activate his account first).

#### (6) Activate account:
- **For:** After user decativates his account, at some point he/ she needs to activate it again.
- **Requirments:** Valid email and password and we would send him an activation link in an email to his primary email mailbox.
- **Result:** The user can acccess our private resources as much as he wants.

#### (7) Delete Account:
- **For:** If user wants to delete his account from our system permanantly.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** If he wants to access our private resources again, he cant activate his account but needs to sign up from the scratch again (Just new process).

#### (8) Change Password:
- **For:** The user can change his password whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token). + old password, new password, confirm passwrd.
- **Result:** His passowrd gets updated.

#### (9) Forget Passowrd:
- **For:** If user forgot his password and only remeber his email, he/ she can recover his account again easily.
- **Requirments:** Just a correct email in our DB and access to his mailbox (So, he can recieve our emails).
- **Result:** Can access his account whatever happened.

#### (10) Reset Password:
- **For:** Once user clicks on the email sent to his mailbox,  we verifiy it and make him/ her create a new password.
- **Requirments:** Just access to his primary mailbox.
- **Result:** Direct access to his account and our private resources.

#### (11) Update sesesion:
- **For:** When the access token gets expired, the user can use his refresh token to get a new access and refresh tokens.
- **Requirments:** Just a valid refresh token.
- **Result:** Access to our private resources again.

#### (12) Show All active sessions:
- **For:** This endpoint tells the user how many session are active and information about each one. So, he can cancel any of them as he want.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** Can show and controll over all his account session by using his current sesssion (device).

#### (13) cancel session/ Revoke tokens:
- **For:** The user can to cancel any sesssion for any reason (expired, lost, compromised, etc...).
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** More control over his account active sessions.

### Security Layer (1): TOTP (Time-Based One-Time-Password) as 2FA 
**(There are 4 securiy layers, the user can only enable one of them or all of them together in addtion to his email and password on every "Really new" login attempt)**
#### (14) Generate TOTP:
- **For:** One user asks for enabling this feature, we send him a secret. So, he/ she can use it in any authenticating app as googl authenticator app etc... and gets a 6 digits code valid only for 30 seconds in return.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** Started the process of enabling TOTP to his account (Getting more secure).

#### (15) Scan TOTP:
- **For:** We offer two options for delivering the user the secret (just the secret, qrcode to scan) both for his authenticating app.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** Finished the second step in the TOTP enabling.

#### (16) Verify TOTP during setup:
- **For:** We need to verify one time the secret during the setup (verify the 6 digits code returned from authenticating app).
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token) + valid 6 digits code.
- **Result:** If it's valid, then this feature is enabled successfully.

#### (17) Disable TOTP:
- **For:** The user can disable this feaute whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** the TOTP is disabled and the account is less secure now.

#### (18) Verify TOTP during login:
- **For:** If user is enabling this feature, he would be asked to give us the 6 digits code from the same authenticating app that he should saved the secret in it before.
- **Requirments:** Just valid credentials + valid 6 digits code.
- **Result:** Access to his account unless he is enabling other security layers.