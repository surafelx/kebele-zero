const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserPoints = require('../models/UserPoints');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function signToken(id) {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, passwordHash: password });

    // Bootstrap an empty points record
    await UserPoints.create({ userId: user._id });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    const userObj = user.toJSON();
    res.json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json({ user: req.user });
}

// POST /api/auth/logout  (stateless — client discards token)
function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}

module.exports = { register, login, getMe, logout };
