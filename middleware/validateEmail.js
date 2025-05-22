// Import the validator library for email validation
const validator = require('validator');

const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res
      .status(400)
      .json({ message: 'A valid email address is required.' });
  }

  next();
};

module.exports = validateEmail;
