const { Router } = require("express");
const User = require("../models/User");
const authenticate = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = Router();
router.use(authenticate);

// GET /api/users
router.get("/", async (req, res) => {
  const users = await User.findAll();
  return success(res, users);
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) return error(res, "Пользователь не найден", 404);

  return success(res, user);
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  const { username, avatar } = req.body;
  const user = await User.findByPk(req.params.id);

  if (!user) return error(res, "Пользователь не найден", 404);

  user.username = username ?? user.username;
  user.avatar = avatar ?? user.avatar;
  await user.save();

  return success(res, user, "Профиль обновлён");
});

// SEARCH /api/users/search/:query
router.get("/search/:query", async (req, res) => {
  const { query } = req.params;

  const users = await User.findAll({
    where: {
      username: require("sequelize").where(
        require("sequelize").fn("LOWER", require("sequelize").col("username")),
        "LIKE",
        `%${query.toLowerCase()}%`
      ),
    },
  });

  return success(res, users);
});

module.exports = router;
