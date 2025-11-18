const User = require("../models/User");
const { Op } = require("sequelize");
const { generateToken } = require("../utils/jwt");
const { validateRegistration } = require("../utils/validators");
const { generateUsername } = require("../utils/generateUsername");
const { success, error } = require("../utils/response");

// Устанавливаем JWT в cookie
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,                     // В prod — обязательно true
    sameSite: "lax",  // sameSite=none работает ТОЛЬКО с secure=true
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username) {
      username = generateUsername(email);
    }

    const validation = validateRegistration({ username, email, password });
    if (!validation.isValid) {
      return error(res, "Ошибка валидации", 400, validation.errors);
    }

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] }
    });

    if (existingUser) {
      return error(res, "Пользователь уже существует", 400);
    }

    const user = await User.create({ username, email, password });

    const token = generateToken({ userId: user.id });
    setAuthCookie(res, token);

    return success(
      res,
      { user: user.toSafeObject(), token },
      "Регистрация успешна",
      201
    );

  } catch (e) {
    console.error("Registration error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.checkPassword(password))) {
      return error(res, "Неверные учетные данные", 400);
    }

    const token = generateToken({ userId: user.id });
    setAuthCookie(res, token);

    return success(res, { user: user.toSafeObject(), token }, "Вход выполнен");

  } catch (e) {
    console.error("Login error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// ---------------- GET ME ----------------
exports.getMe = async (req, res) => {
  try {
    return success(res, { user: req.user.toSafeObject() });
  } catch (e) {
    return error(res, "Ошибка сервера", 500);
  }
};

// ---------------- LOGOUT ----------------
exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return success(res, null, "Выход выполнен");
};
