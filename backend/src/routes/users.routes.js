const { Router } = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

console.log("🔥 users.routes подключён");
const router = Router();
router.use(auth);

/**
 * GET /api/users
 * Получить всех пользователей
 */
router.get("/", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

/**
 * GET /api/users/:id
 * Получить профиль пользователя
 */
router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  res.json(user);
});

/**
 * PUT /api/users/:id
 * Обновить профиль
 */
router.put("/:id", async (req, res) => {
  const { username, avatar } = req.body;

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  user.username = username ?? user.username;
  user.avatar = avatar ?? user.avatar;

  await user.save();

  res.json({ message: "Профиль обновлён", user });
});

/**
 * GET /api/users/search/:query
 * Поиск пользователей
 */
router.get("/search/:query", async (req, res) => {
  const { query } = req.params;

  const users = await User.findAll({
    where: {
      username: require("sequelize").where(
        require("sequelize").fn("LOWER", require("sequelize").col("username")),
        "LIKE",
        "%" + query.toLowerCase() + "%"
      ),
    },
  });

  res.json(users);
});

module.exports = router;
