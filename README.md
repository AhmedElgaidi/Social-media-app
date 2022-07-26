
# Authenticating API
![A screenshot for the project](https://raw.githubusercontent.com/AhmedElgaidi/Social-media-app/main/public/sreenshot.png)

### Project Links:
- [Live API on Heroku ready for consuming](https://social-app-260.herokuapp.com/)
- [API postman documentation ready for reading](https://documenter.getpostman.com/view/8694181/UzXM1yep)


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

### Security Layer (2): OTP (One-Time-Password) as 2FA 
#### (19) Enable OTP:
- **For:** An aditional security layer besides the credentials (email + password) + TOTP (if enabled).
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** On every new login device attempt we send him a 6 digits code to his primary email mailbox.

#### (20) Verify OTP:
- **For:** After sending the user the 6 digits code to his mailbox, he should send them back withn 6h before getting expired.
- **Requirments:** Valid credentials + Access to mailbox.
- **Result:** The user useses this sent code to access his account.

#### (21) Disable OTP: 
- **For:** The user can disable this feature whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** OTP feature is disabled and the user account is less secure now.

#### (22) Resend OTP: 
- **For:** If the 6 digits code were expired, the user can ask for new valid ones.
- **Requirments:** Correct credentials + The old 6 digits should be expired.
- **Result:** Recieves an email with the new 6 digit codes. so, he can access our private resoucres.


### Security Layer (3): SMS (6 digits code over sms message) as 2FA 
#### (23) Enable SMS:
- **For:** Aditional security layer besides (correct credential, TOTP, OTP) layers.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token) + valid phone number.
- **Result:** started the sms as 2fa process.

#### (24) Verify phone number:
- **For:** For verifing the given phone number, by sending him a trial 6 digits code and wait for them.
- **Requirments:** Just access to a valid phone number.
- **Result:** If the code sent to him is same as the given one and not expired then the user finished the second step successfully.

#### (25) Resend Message:
- **For:** If the 6 digits code get expired, the user can ask for new ones durin the setup
- **Requirments:** Access to a valid phone number and expired 6 digits code.
- **Result:** We send him again a new code, so, he can continue the enabling process.

#### (26) Disable SMS:
- **For:** The user can disable this feature whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** The feature is disabled.

#### (27) Send SMS Code during login:
- **For:** After user has enabled this feature, now we send him a 6 digits code on every new login attempt in order to authenticate him.
- **Requirments:** Correct credentials(email, password) + This feature is enabled to his account.
- **Result:** The user recieves a 6 digits codes to prove his identity.


#### (28) Verify SMS Code during login:
- **For:** After user reciveve the 6 digits code to his phone number, he needs to send them back to use to verify them. 
- **Requirments:** Correct credentials + this feature is enabled + access to phone.
- **Result:** The user can complete his logn attempt.

#### (29) Resend SMS during login:
- **For:** If the sent 6 digits code during login attempt is expired, the user can ask for new one.
- **Requirments:** Correct credentials(email+ password) + enabling this feature + access to phone number + already expired code.
- **Resutlt:** Access to our private resources.

### Security Layer (4): Security question as 2FA 
#### (30) Enable:
- **For:** Aditional security layer behind the credentials(email + pasword), TOTP, OTP, SMS.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token) + question + answer + hint
- **Result:** Enabled this security layer.

#### (31) Change (update) question/ answer/ hint:
- **For:** The user can chane those data whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** Mor control over this security layer.


#### (32) Disable:
- **For:** The user can disable this feature whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** This feature would be disabled.


#### (33) Verifying during login attempt:
- **For:** We show the user the question and the hint after successfull login attempt and waits for his answer to be verified.
- **Requirments:** Correct credentials(email + password) + this feature is enabled.
- **Result:** Access to our private resoucres again.


#### (34) show all account 2FA methods:
- **For:** The user can know the status (enabled/ disabled) of each layer/ method in his account.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- **Result:** More control over his account security options.


### Account Recovery options:
**(If the user can't log in with his credentials and can't use his enabled 2fa methods, he still can recover and get access to his account and then our private resources)**
**To enable any recoveyr option, the user has to enable at least 2 options/ methods of 2FA methods**
#### Method (2): 10 back up codes 
#### (35) Show backup codes:
- For: The use can know the status(enabled/ disabled) of this feature and see the 10 backup codes and which one is used and which isn't etc...
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token) + this feature should be enabled.
- Result: More control over his account security.

#### (36) Enable:
- For: The user can ask for enabling this feature and we return him 10 temporary 12-digits codes
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- Result: 10 temporary 12 digits codes (Finished first step).


#### (37) Regenerate Temporary Codes:
- For: The user can regenerate a new 10 codes whenever he wants(he lost them, compromised, used all of them, etc...).
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- Result: Finsihed he second step in the process of enabling backup codes recovery method.

#### (38) confirm and enableTemporary codes:
- For: After showing the user the 10 codes he has to confirm that he saved/ download them.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- Result: The Thirdand last step for enabling this recovery option.

#### (39) Disable: 
- For: The user can disable this feature whenever he wants.
- **Requirments:** Just a valid access token (or at least a valid refresh token that brings him valid access token).
- Result: This feature is disabled and the account is less risky to be lost.

#### (40) Verify during recovery:
- For: IF user can't login with his credentials or there is somehting wrong with the 2FA methods, he can send his one of the 10 backup codes and we give him access again and then he can change whatever he wants in his accoutn settings.
- Requirments: Just Bad luck :)
- Result: Recover his account.

### Method (2): Trusted/ secondary email

#### (41) 