const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessionsController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, sessionsController.getSessions);
router.delete('/logout-other', requireAuth, sessionsController.logoutOtherSessions);
router.delete('/logout-all', requireAuth, sessionsController.logoutAllSessions);
router.delete('/:id', requireAuth, sessionsController.revokeSession);

module.exports = router;
