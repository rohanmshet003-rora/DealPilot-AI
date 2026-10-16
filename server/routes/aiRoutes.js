const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { analyzeNegotiation, generateCompromises, chatWithCopilot } = require('../services/geminiService');

// Get AI Strategic Negotiation Analysis
router.get('/analysis', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const room = roomRes.rows[0];

    const offersRes = await db.query('SELECT * FROM offers WHERE room_id = $1 ORDER BY round_number ASC', [roomId]);
    const messagesRes = await db.query('SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC', [roomId]);

    // Determine current user's role
    let currentRole = 'buyer';
    if (room.creator_id === req.user.id) {
      currentRole = room.creator_role;
    } else if (room.counterpart_id === req.user.id) {
      currentRole = room.creator_role === 'seller' ? 'buyer' : 'seller';
    }

    const analysis = await analyzeNegotiation(room, offersRes.rows, messagesRes.rows, currentRole);

    res.json({
      success: true,
      role: currentRole,
      analysis,
    });
  } catch (err) {
    console.error('AI Analysis error:', err);
    res.status(500).json({ success: false, message: 'Error generating AI analysis', error: err.message });
  }
});

// Get Intelligent Compromise Suggestions
router.get('/compromises', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const room = roomRes.rows[0];
    const offersRes = await db.query('SELECT * FROM offers WHERE room_id = $1 ORDER BY round_number ASC', [roomId]);

    const packages = await generateCompromises(room, offersRes.rows);

    res.json({
      success: true,
      packages,
    });
  } catch (err) {
    console.error('AI Compromises error:', err);
    res.status(500).json({ success: false, message: 'Error generating compromise suggestions', error: err.message });
  }
});

// Interactive AI Copilot Chat
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required.' });
    }

    const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const room = roomRes.rows[0];
    const offersRes = await db.query('SELECT * FROM offers WHERE room_id = $1 ORDER BY round_number ASC', [roomId]);

    let userRole = 'buyer';
    if (room.creator_id === req.user.id) {
      userRole = room.creator_role;
    } else if (room.counterpart_id === req.user.id) {
      userRole = room.creator_role === 'seller' ? 'buyer' : 'seller';
    }

    const response = await chatWithCopilot(room, offersRes.rows, userRole, query.trim());

    res.json({
      success: true,
      ...response,
    });
  } catch (err) {
    console.error('AI Chat error:', err);
    res.status(500).json({ success: false, message: 'Error communicating with AI Copilot' });
  }
});

module.exports = router;
