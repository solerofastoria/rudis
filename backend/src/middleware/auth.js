const jwt = require("jsonwebtoken");
const db = require("../models");

async function authenticate(req, res, next) {
  try {
    // Получаем токен из cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Нет токена, доступ запрещён" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    req.user = user;
    next();

  } catch (e) {
    console.error("AUTH ERROR:", e);
    res.status(401).json({ message: "Неверный токен" });
  }
}

module.exports = authenticate;
