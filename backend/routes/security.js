const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/login-history', requireAuth, securityController.getLoginHistory);
router.get('/audit-logs', requireAuth, securityController.getAuditLogs);

module.exports = router;
