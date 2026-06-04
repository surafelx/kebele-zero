const express = require('express');
const { getAll, create, update, remove } = require('../controllers/socialLinksController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAll);
router.post('/', requireAuth, requireAdmin, create);
router.put('/:id', requireAuth, requireAdmin, update);
router.delete('/:id', requireAuth, requireAdmin, remove);

module.exports = router;
