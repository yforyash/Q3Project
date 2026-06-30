const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const { validateFields } = require('../middlewares/validationMiddleware');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/signup', authLimiter, validateFields([
  { field: 'first_name', required: true },
  { field: 'last_name', required: true },
  { field: 'email', required: true, isEmail: true },
  { field: 'password', required: true, minLength: 8 },
]), authController.signup);

router.post('/verify-email', authLimiter, validateFields([
  { field: 'email', required: true, isEmail: true },
  { field: 'otp', required: true, minLength: 6, maxLength: 6 },
]), authController.verifyEmail);

router.post('/resend-otp', authLimiter, validateFields([
  { field: 'email', required: true, isEmail: true },
  { field: 'purpose', required: true },
]), authController.resendOtp);

router.post('/login', authLimiter, validateFields([
  { field: 'email', required: true, isEmail: true },
  { field: 'password', required: true },
]), authController.login);

router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', authLimiter, validateFields([
  { field: 'email', required: true, isEmail: true },
]), authController.forgotPassword);

router.post('/verify-reset-otp', authLimiter, validateFields([
  { field: 'email', required: true, isEmail: true },
  { field: 'otp', required: true, minLength: 6, maxLength: 6 },
]), authController.verifyResetOtp);

router.post('/reset-password', authLimiter, validateFields([
  { field: 'email', required: true, isEmail: true },
  { field: 'password', required: true, minLength: 8 },
]), authController.resetPassword);

router.post('/change-password', requireAuth, validateFields([
  { field: 'current_password', required: true },
  { field: 'new_password', required: true, minLength: 8 },
]), authController.changePassword);

module.exports = router;
