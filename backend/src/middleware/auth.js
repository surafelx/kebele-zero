const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');

/**
 * Require a valid JWT. Attaches req.user (lean User doc) on success.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Require the authenticated user to have the admin role.
 * Must be chained after requireAuth.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

/**
 * Attach req.user if a valid token is present, but do NOT block unauthenticated
 * requests (public endpoints that optionally show user-specific data).
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id).lean();
      if (user) req.user = user;
    }
  } catch {
    // ignore — token may be invalid or absent
  }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
