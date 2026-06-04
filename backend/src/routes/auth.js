const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);

module.exports = router;
