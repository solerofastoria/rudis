const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Нет токена, доступ запрещён" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

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
