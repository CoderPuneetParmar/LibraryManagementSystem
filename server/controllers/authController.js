const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Helper to sign JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'super_secret_library_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

// Register - Always creates role='member'
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt
      // Generate membership_id in format MEM-{year}-{seq}
      const currentYear = new Date().getFullYear();
      const { Op } = require('sequelize');
      // Find highest existing seq for the current year
      const existingIds = await User.findAll({
        where: {
          membership_id: { [Op.like]: `MEM-${currentYear}-%` }
        },
        attributes: ['membership_id']
      });
      const seqNumbers = existingIds.map(u => {
        const parts = u.membership_id.split('-');
        return parseInt(parts[2], 10) || 0;
      });
      const maxSeq = seqNumbers.length ? Math.max(...seqNumbers) : 0;
      const nextSeq = maxSeq + 1;
      const paddedSeq = String(nextSeq).padStart(3, '0');
      const membership_id = `MEM-${currentYear}-${paddedSeq}`;

    // Strictly role='member'
    const user = await User.create({
      name,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role: 'member',
      phone: phone || null,
      membership_id,
      join_date: new Date()
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership_id: user.membership_id,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership_id: user.membership_id,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// Get current user profile (/api/auth/me)
exports.getMe = async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user profile.' });
  }
};

// Admin list all members (used for offline issue lookup & member directory)
exports.getAllMembers = async (req, res) => {
  try {
    const members = await User.findAll({
      where: { role: 'member' },
      attributes: ['id', 'name', 'email', 'phone', 'membership_id', 'join_date']
    });
    return res.json(members);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching members.' });
  }
};
