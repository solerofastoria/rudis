const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const errors = [];
  
  // Проверка длины
  if (password.length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов');
  }
  
  if (password.length > 128) {
    errors.push('Пароль не должен превышать 128 символов');
  }
  
  // Проверка на наличие букв и цифр
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну букву');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }
  
  // Проверка на наличие заглавных и строчных букв
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву');
  }
  
  return errors;
};

const validateUsername = (username) => {
  const errors = [];
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  
  if (!usernameRegex.test(username)) {
    if (username.length < 3) {
      errors.push('Имя пользователя должно содержать минимум 3 символа');
    } else if (username.length > 30) {
      errors.push('Имя пользователя не должно превышать 30 символов');
    } else {
      errors.push('Имя пользователя может содержать только буквы, цифры и подчеркивания');
    }
  }
  
  return errors;
};

const validateRegistration = (data) => {
  const { username, email, password } = data;
  const errors = [];

  // Валидация имени пользователя
  const usernameErrors = validateUsername(username);
  errors.push(...usernameErrors);

  // Валидация email
  if (!validateEmail(email)) {
    errors.push('Введите корректный email адрес');
  }

  // Валидация пароля
  const passwordErrors = validatePassword(password);
  errors.push(...passwordErrors);

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