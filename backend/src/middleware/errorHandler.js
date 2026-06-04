/**
 * Central error handler. All unhandled errors reach here via next(err).
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }

  // Mongoose duplicate key (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Mongoose cast error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${status}] ${message}`, err.stack);
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;
