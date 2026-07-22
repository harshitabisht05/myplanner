const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fallback to Authorization header if provided
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const secret = process.env.JWT_SECRET || 'planner_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
