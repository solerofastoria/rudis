const User = require("../models/User");
const { Op } = require("sequelize");
const { generateToken } = require("../utils/jwt");
const { validateRegistration } = require("../utils/validators");
const { generateUsername } = require("../utils/generateUsername");

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username) {
      username = generateUsername(email);
    }

    const validation = validateRegistration({ username, email, password });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = generateToken({ userId: user.id });

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false });
  }
};


// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.checkPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ userId: user.id });

    res.json({
      success: true,
      data: { user: user.toSafeObject(), token },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ success: false });
  }
};


// ---------------- GET ME ----------------
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toSafeObject(),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};


// ---------------- LOGOUT ----------------
exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out" });
};
