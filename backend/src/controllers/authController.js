const { Op } = require('sequelize');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validateRegistration } = require('../utils/validators');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Валидация
    const validation = validateRegistration({ username, email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Проверка существующего пользователя
     const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      const errors = [];
      if (existingUser.email === email) errors.push('Email already registered');
      if (existingUser.username === username) errors.push('Username already taken');
      
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        errors
      });
    }

    // Создание пользователя
    const user = await User.create({
      username,
      email,
      password,
      status: 'online'
    });

    // Генерация токена
    const token = generateToken({ 
      userId: user.id,
      username: user.username
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Поиск пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Обновление статуса
    await user.update({ 
      status: 'online',
      lastSeen: new Date()
    });

    // Генерация токена
    const token = generateToken({ 
      userId: user.id,
      username: user.username
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      await user.update({ 
        status: 'offline',
        lastSeen: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};