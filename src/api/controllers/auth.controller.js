const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const PasswordResetToken = require('../models/passwordResetToken.model');
const { jwtExpirationInterval } = require('../../config/vars');
const APIError = require('../errors/api-error');
const emailProvider = require('../services/emails/emailProvider');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const userData = req.body;
    const existUser = await User.findOne({email: req.body.email, phone: req.body.phone})
    if(existUser) {
      throw new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true
      });
    } else {
      const phone = req.body.phone;
      const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
                  .verifications
                  .create({to: '+' + phone, channel: 'whatsapp'})
                  console.log(1111111, '+' + verification)
      if(verification.status == 'pending') {
        req.session.user = userData;
        return res.json({status: "Codesent"});
      }
    }
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

exports.phoneVerify = async (req, res, next) => {
  try {
    const code = req.body.code;
    const phone = req.body.user.phone;
    const userData = req.body.user;
    if(code) {
      const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
                  .verificationChecks
                  .create({to: '+' + phone, code: code});
      if (verificationCheck.status === 'approved') {
        const user = await new User(userData).save();
        const userTransformed = user.transform();
        const token = generateTokenResponse(user, user.token());
        res.status(httpStatus.CREATED);
        return res.json({ token, user: userTransformed });
      } else {
        err.message = "Code doesn't match";
        throw new APIError(err);
      }
    }
  } catch(error) {
    return next(User.checkDuplicateEmail(error));
  }
}

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

exports.sendPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user) {
      const passwordResetObj = await PasswordResetToken.generate(user);
      emailProvider.sendPasswordReset(passwordResetObj);
      res.status(httpStatus.OK);
      return res.json('success');
    }
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'No account found with that email',
    });
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, resetToken } = req.body;
    const resetTokenObject = await PasswordResetToken.findOneAndRemove({
      userEmail: email,
      resetToken,
    });

    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (!resetTokenObject) {
      err.message = 'Cannot find matching reset token';
      throw new APIError(err);
    }
    if (moment().isAfter(resetTokenObject.expires)) {
      err.message = 'Reset token is expired';
      throw new APIError(err);
    }

    const user = await User.findOne({ email: resetTokenObject.userEmail }).exec();
    user.password = password;
    await user.save();
    emailProvider.sendPasswordChangeEmail(user);

    res.status(httpStatus.OK);
    return res.json('Password Updated');
  } catch (error) {
    return next(error);
  }
};
