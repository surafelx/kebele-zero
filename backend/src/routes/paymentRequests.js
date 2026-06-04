const express = require('express');
const { getAll, create, updateStatus } = require('../controllers/paymentRequestController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getAll);
router.post('/', requireAuth, create);
router.put('/:id/status', requireAuth, updateStatus);

module.exports = router;
