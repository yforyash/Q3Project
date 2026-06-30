const crypto = require('crypto');
const db = require('../config/db');
const { logAudit } = require('../services/auditService');

async function getSessions(req, res) {
  try {
    const sessions = await db.query('SELECT id, ip_address, user_agent, created_at, last_activity, is_active FROM sessions WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.status(200).json(sessions.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function logoutOtherSessions(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const tokenHash = token ? crypto.createHash('sha256').update(token).digest('hex') : '';
  try {
    await db.query('UPDATE sessions SET is_active = FALSE WHERE user_id = $1 AND token_hash != $2', [req.user.id, tokenHash]);
    await logAudit(req.user.id, 'logout_other_sessions', req);
    res.status(200).json({ message: 'Other sessions deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function logoutAllSessions(req, res) {
  try {
    await db.query('UPDATE sessions SET is_active = FALSE WHERE user_id = $1', [req.user.id]);
    await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1', [req.user.id]);
    res.clearCookie('refreshToken');
    res.clearCookie('rememberMe');
    await logAudit(req.user.id, 'logout_all_sessions', req);
    res.status(200).json({ message: 'All sessions deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function revokeSession(req, res) {
  const { id } = req.params;
  try {
    await db.query('UPDATE sessions SET is_active = FALSE WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    await logAudit(req.user.id, 'delete_session', req, { sessionId: id });
    res.status(200).json({ message: 'Session revoked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getSessions, logoutOtherSessions, logoutAllSessions, revokeSession };
