const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user.toSafeObject();
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId);
      if (user) req.user = user.toSafeObject();
    }
    next();
  } catch {
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuth,
};
