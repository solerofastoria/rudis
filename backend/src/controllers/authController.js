const { User } = require("../models");
const { Op } = require("sequelize");
const { generateToken } = require("../utils/jwt");
const { validateRegistration } = require("../utils/validators");
const { generateUsername } = require("../utils/generateUsername");
const { success, error } = require("../utils/response");

// Устанавливаем JWT в cookie
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  const isSecure = isProd || process.env.COOKIE_SECURE === "true";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
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
      // Проверяем, что именно уже существует
      if (existingUser.email === email) {
        return error(res, "Пользователь с таким email уже существует", 400);
      }
      if (existingUser.username === username) {
        return error(res, "Пользователь с таким именем уже существует", 400);
      }
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
  const isProd = process.env.NODE_ENV === "production";
  const isSecure = isProd || process.env.COOKIE_SECURE === "true";
  
  res.clearCookie("token", {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
  });
  
  return success(res, null, "Вы успешно вышли из аккаунта");

};

// ---------------- UPDATE PROFILE ----------------
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, status, avatar } = req.body;
    const userId = req.user.id;
    
    // Проверяем, что email и username уникальны (если они изменяются)
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return error(res, "Пользователь с таким email уже существует", 400);
      }
    }
    
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return error(res, "Пользователь с таким именем уже существует", 400);
      }
    }
    
    // Обновляем пользователя
    const updatedUser = await User.update(
      { username, email, status, avatar },
      { where: { id: userId }, returning: true }
    );
    
    // Получаем обновленного пользователя
    const user = await User.findByPk(userId);
    
    return success(res, { user: user.toSafeObject() }, "Профиль успешно обновлен");
  } catch (e) {
    console.error("Update profile error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};
