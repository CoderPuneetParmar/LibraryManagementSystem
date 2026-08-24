const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_library_jwt_key_2026');

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'membership_id', 'phone']
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed. Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
