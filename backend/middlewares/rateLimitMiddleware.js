const { rateLimit } = require('express-rate-limit');
require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 100, // virtually unlimited in dev
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 20, // virtually unlimited in dev
  message: { error: 'Too many authentication attempts, please try again later' },
});

module.exports = { generalLimiter, authLimiter };
