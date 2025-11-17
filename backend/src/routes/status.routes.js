const { Router } = require("express");
const router = Router();

let onlineUsers = {};

router.get("/", (req, res) => {
  res.json({ onlineUsers: Object.keys(onlineUsers) });
});

router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  res.json({
    userId,
    online: Boolean(onlineUsers[userId]),
    lastSeen: onlineUsers[userId]?.lastSeen || null
  });
});

module.exports = router;
