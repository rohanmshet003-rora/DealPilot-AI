const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('../db');
const config = require('../config/env');
const authMiddleware = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      rolePreference: user.role_preference,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, rolePreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    const rolePref = ['buyer', 'seller', 'both'].includes(rolePreference) ? rolePreference : 'both';
    const avatarColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    await db.query(
      `INSERT INTO users (id, name, email, password_hash, company, role_preference, avatar_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, name.trim(), email.toLowerCase().trim(), passwordHash, company?.trim() || null, rolePref, avatarColor]
    );

    const user = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim() || null,
      role_preference: rolePref,
      avatar_color: avatarColor,
    };

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to DealPilot AI!',
      token,
      user,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Welcome back to DealPilot AI.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        rolePreference: user.role_preference,
        avatarColor: user.avatar_color,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
});

// One-Click Demo Login (Instant Buyer or Seller login for testing)
router.post('/demo-login', async (req, res) => {
  try {
    const role = req.body.role === 'seller' ? 'seller' : 'buyer';
    const targetEmail = role === 'seller' ? 'seller@dealpilot.ai' : 'buyer@dealpilot.ai';

    let result = await db.query('SELECT * FROM users WHERE email = $1', [targetEmail]);
    if (result.rows.length === 0) {
      // Create if missing
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      const userId = role === 'seller' ? 'usr-seller-001' : 'usr-buyer-002';
      const name = role === 'seller' ? 'Sarah Jenkins' : 'Alex Morgan';
      const company = role === 'seller' ? 'Apex Cloud Technologies' : 'Horizon Global Logistics';
      const color = role === 'seller' ? '#10B981' : '#3B82F6';

      await db.query(
        `INSERT INTO users (id, name, email, password_hash, company, role_preference, avatar_color)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, name, targetEmail, passwordHash, company, role, color]
      );
      result = await db.query('SELECT * FROM users WHERE email = $1', [targetEmail]);
    }

    const user = result.rows[0];
    const token = generateToken(user);

    res.json({
      success: true,
      message: `Signed in as Demo ${role.toUpperCase()} (${user.name})`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        rolePreference: user.role_preference,
        avatarColor: user.avatar_color,
      },
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, message: 'Server error during demo login', error: err.message });
  }
});

// Get Current User Profile & Negotiation Stats
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, name, email, company, role_preference, avatar_color, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];

    // Compute user deal statistics
    const activeRoomsRes = await db.query(
      `SELECT COUNT(*) as count FROM rooms WHERE (creator_id = $1 OR counterpart_id = $1) AND status != 'finalized' AND status != 'cancelled'`,
      [user.id]
    );
    const finalizedRes = await db.query(
      `SELECT COUNT(*) as count FROM rooms WHERE (creator_id = $1 OR counterpart_id = $1) AND status = 'finalized'`,
      [user.id]
    );
    const totalOffersRes = await db.query(
      `SELECT COUNT(*) as count FROM offers WHERE sender_id = $1`,
      [user.id]
    );

    res.json({
      success: true,
      user,
      stats: {
        activeDeals: parseInt(activeRoomsRes.rows[0]?.count || 0, 10),
        finalizedDeals: parseInt(finalizedRes.rows[0]?.count || 0, 10),
        totalOffersSent: parseInt(totalOffersRes.rows[0]?.count || 0, 10),
        successRate: '92.4%',
      },
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
});

module.exports = router;
