function validateFields(rules) {
  return async (req, res, next) => {
    const errors = [];
    for (const rule of rules) {
      const { field, required, isEmail, minLength, maxLength } = rule;
      const value = req.body[field];
      if (required && (value === undefined || value === null || String(value).trim() === '')) {
        errors.push({ path: field, msg: `${field} is required` });
        continue;
      }
      if (value !== undefined && value !== null) {
        if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({ path: field, msg: 'Invalid email format' });
        }
        if (minLength && String(value).length < minLength) {
          errors.push({ path: field, msg: `${field} must be at least ${minLength} characters` });
        }
        if (maxLength && String(value).length > maxLength) {
          errors.push({ path: field, msg: `${field} must be at most ${maxLength} characters` });
        }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  };
}

module.exports = { validateFields };
