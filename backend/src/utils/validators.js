const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

const validateRegistration = (data) => {
  const { username, email, password } = data;
  const errors = [];

  if (!validateUsername(username)) {
    errors.push('Username must be 3-30 characters and contain only letters, numbers, and underscores');
  }

  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRegistration
};