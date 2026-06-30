const db = require('../config/db');

async function logAudit(userId, action, req, details = {}) {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, user_agent, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, req.ip, req.headers['user-agent'], JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}

async function logSecurityEvent(userId, eventType, req, severity, details = {}) {
  try {
    await db.query(
      'INSERT INTO security_events (user_id, event_type, ip_address, severity, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, eventType, req.ip, severity, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Security event write error:', err);
  }
}

module.exports = { logAudit, logSecurityEvent };
