const { validationResult } = require('express-validator');

/**
 * Run after a chain of express-validator checks.
 * Returns 422 with structured errors if any check failed.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation error',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
