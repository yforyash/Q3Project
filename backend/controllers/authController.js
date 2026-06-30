const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { generateOTP, verifyOTP } = require('../services/otpService');
const { sendEmail } = require('../services/emailService');
const { logAudit, logSecurityEvent } = require('../services/auditService');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_54321';

async function signup(req, res) {
  const { first_name, last_name, email, phone, password } = req.body;
  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    const userRes = await db.query(
      'INSERT INTO users (first_name, last_name, email, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [first_name, last_name, email, phone]
    );
    const userId = userRes.rows[0].id;
    const roleRes = await db.query("SELECT id FROM roles WHERE name = 'user'");
    if (roleRes.rows.length > 0) {
      await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleRes.rows[0].id]);
    }
    const bcryptHash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)', [userId, bcryptHash]);
    const otp = await generateOTP(email, 'signup');
    await sendEmail(email, 'Verify Your Email Address', `Your OTP code is: ${otp}`);
    await logAudit(userId, 'user_signup', req);
    res.status(201).json({ message: 'Signup successful. Please check your email for verification OTP.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
}

async function verifyEmail(req, res) {
  const { email, otp } = req.body;
  try {
    const otpVerify = await verifyOTP(email, otp, 'signup');
    if (!otpVerify.valid) return res.status(400).json({ error: otpVerify.message });
    await db.query("UPDATE users SET email_verified = TRUE, status = 'active' WHERE email = $1", [email]);
    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during verification' });
  }
}

async function resendOtp(req, res) {
  const { email, purpose } = req.body;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const otp = await generateOTP(email, purpose);
    await sendEmail(email, 'Your OTP Code', `Your code is: ${otp}`);
    res.status(200).json({ message: 'New OTP code dispatched' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error sending OTP' });
  }
}

async function login(req, res) {
  const { email, password, remember_me } = req.body;
  try {
    const userRes = await db.query(
      'SELECT u.*, r.name as role FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.id WHERE u.email = $1',
      [email]
    );
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const user = userRes.rows[0];
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended' });
    }
    const passRes = await db.query('SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.id]);
    if (passRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isCorrect = await bcrypt.compare(password, passRes.rows[0].password_hash);
    if (!isCorrect) {
      await db.query('INSERT INTO login_logs (user_id, ip_address, user_agent, status, failure_reason) VALUES ($1, $2, $3, $4, $5)', [
        user.id, req.ip, req.headers['user-agent'], 'failed', 'Invalid credentials',
      ]);
      await logSecurityEvent(user.id, 'login_failed', req, 'medium', { reason: 'Invalid credentials' });
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [user.id, refreshHash, refreshExpires]);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    if (remember_me) {
      const rememberRaw = crypto.randomBytes(32).toString('hex');
      const rememberHash = crypto.createHash('sha256').update(rememberRaw).digest('hex');
      const rememberExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.query('INSERT INTO remember_me_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [user.id, rememberHash, rememberExpires]);
      res.cookie('rememberMe', rememberRaw, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    const sessionTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const sessionExpires = new Date(Date.now() + 15 * 60 * 1000);
    await db.query(
      'INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [user.id, sessionTokenHash, req.ip, req.headers['user-agent'], sessionExpires]
    );
    await db.query('INSERT INTO login_logs (user_id, ip_address, user_agent, status) VALUES ($1, $2, $3, $4)', [
      user.id, req.ip, req.headers['user-agent'], 'success',
    ]);
    await sendEmail(user.email, 'Security Alert: New Login Detected', 'You logged in successfully.');
    res.status(200).json({ token: accessToken, user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

async function logout(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    const sessionHash = crypto.createHash('sha256').update(token).digest('hex');
    await db.query('UPDATE sessions SET is_active = FALSE WHERE token_hash = $1', [sessionHash]);
  }
  const refreshCookie = req.cookies.refreshToken;
  if (refreshCookie) {
    const refreshHash = crypto.createHash('sha256').update(refreshCookie).digest('hex');
    await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1', [refreshHash]);
  }
  res.clearCookie('refreshToken');
  res.clearCookie('rememberMe');
  res.status(200).json({ message: 'Logged out successfully' });
}

async function refreshToken(req, res) {
  const refreshCookie = req.cookies.refreshToken;
  if (!refreshCookie) return res.status(401).json({ error: 'Refresh token not found' });
  try {
    const decoded = jwt.verify(refreshCookie, JWT_REFRESH_SECRET);
    const refreshHash = crypto.createHash('sha256').update(refreshCookie).digest('hex');
    const resDb = await db.query('SELECT * FROM refresh_tokens WHERE token_hash = $1 AND is_revoked = FALSE', [refreshHash]);
    if (resDb.rows.length === 0) return res.status(401).json({ error: 'Revoked refresh token' });
    const userRes = await db.query('SELECT u.*, r.name as role FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.id WHERE u.id = $1', [decoded.id]);
    if (userRes.rows.length === 0 || userRes.rows[0].status !== 'active') {
      return res.status(401).json({ error: 'Invalid user status' });
    }
    const user = userRes.rows[0];
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const newRefreshHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const newRefreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1', [refreshHash]);
    await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [user.id, newRefreshHash, newRefreshExpires]);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(200).json({ message: 'If email exists, reset OTP is sent' });
    const otp = await generateOTP(email, 'password_reset');
    await sendEmail(email, 'Password Reset OTP Code', `Your OTP code is: ${otp}`);
    res.status(200).json({ message: 'Reset OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function verifyResetOtp(req, res) {
  const { email, otp } = req.body;
  try {
    const otpVerify = await verifyOTP(email, otp, 'password_reset');
    if (!otpVerify.valid) return res.status(400).json({ error: otpVerify.message });
    const resetToken = crypto.randomBytes(32).toString('hex');
    res.status(200).json({ resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function resetPassword(req, res) {
  const { email, password } = req.body;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userId = userRes.rows[0].id;
    const bcryptHash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)', [userId, bcryptHash]);
    await logAudit(userId, 'password_reset', req);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  try {
    const passRes = await db.query('SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.user.id]);
    if (passRes.rows.length === 0) return res.status(404).json({ error: 'Credentials error' });
    const isCorrect = await bcrypt.compare(current_password, passRes.rows[0].password_hash);
    if (!isCorrect) return res.status(400).json({ error: 'Invalid current password' });
    const bcryptHash = await bcrypt.hash(new_password, 10);
    await db.query('INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)', [req.user.id, bcryptHash]);
    await logAudit(req.user.id, 'password_change', req);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  signup,
  verifyEmail,
  resendOtp,
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
};
