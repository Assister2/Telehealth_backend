const Joi = require('joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: {
      username: Joi.string()
        .required()
        .min(6),
      email: Joi.string()
        .email()
        .required(),
      phone: Joi.string()
        .required(),
      license: Joi.string(),
      speciality: Joi.string(),
      role: Joi.string(),
      gender: Joi.string()
        .required(),
      password: Joi.string()
        .required()
        .min(6)
        .max(128),
    },
  },

  // POST /v1/auth/login
  login: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .required()
        .max(128),
    },
  },

  // POST /v1/auth/facebook
  // POST /v1/auth/google
  oAuth: {
    body: {
      access_token: Joi.string().required(),
    },
  },

  // POST /v1/auth/refresh
  refresh: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      refreshToken: Joi.string().required(),
    },
  },

  // POST /v1/auth/refresh
  sendPasswordReset: {
    body: {
      email: Joi.string()
        .email()
        .required(),
    },
  },

  // POST /v1/auth/password-reset
  passwordReset: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .required()
        .min(6)
        .max(128),
      resetToken: Joi.string().required(),
    },
  },

  //POST /v1/auth/verify
  phoneVerify: {
    body: {
      code: Joi.string().required()
    }
  }
};
