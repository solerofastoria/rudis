const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const header = req.header("Authorization");

    if (!header) {
      return res.status(401).json({ message: "Нет токена" });
    }

    const token = header.startsWith("Bearer ")
      ? header.split(" ")[1]
      : header;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (e) {
    console.error("JWT ERROR:", e.message);
    res.status(401).json({ message: "Неверный токен" });
  }
};

module.exports = authenticate;
