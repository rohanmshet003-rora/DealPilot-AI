const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

function generateRoomCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DP-${num}`;
}

// Create a new negotiation room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      currency = 'INR',
      creatorRole = 'seller',
      initialPrice,
      targetPrice,
      initialPaymentTerms = '50% Upfront, 50% on Delivery',
      initialPaymentMethod = 'Bank Wire Transfer',
      initialDeliveryMethod = 'Standard Ground',
      initialDeliveryCostBearer = 'Seller Pays',
      initialDeliveryDeadlineDays = 7,
      initialInspectionWindowDays = 14,
      initialNotes,
    } = req.body;

    if (!title || !category || !initialPrice) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and initial price are required.',
      });
    }

    const roomId = uuidv4();
    const roomCode = generateRoomCode();
    const agoraChannel = `dealpilot_${roomId.replace(/-/g, '_')}`;
    const role = creatorRole === 'buyer' ? 'buyer' : 'seller';
    const parsedInitialPrice = parseFloat(initialPrice);
    const parsedTargetPrice = targetPrice ? parseFloat(targetPrice) : null;

    // Create room
    await db.query(
      `INSERT INTO rooms (id, room_code, title, category, description, currency, creator_id, creator_role, initial_price, target_price, status, agora_channel)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        roomId,
        roomCode,
        title.trim(),
        category,
        description?.trim() || '',
        currency,
        req.user.id,
        role,
        parsedInitialPrice,
        parsedTargetPrice,
        'active',
        agoraChannel,
      ]
    );

    // Create initial offer from creator
    const offerId = uuidv4();
    await db.query(
      `INSERT INTO offers (id, room_id, sender_id, sender_role, round_number, price, payment_terms, payment_method, delivery_method, delivery_cost_bearer, delivery_deadline_days, inspection_window_days, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        offerId,
        roomId,
        req.user.id,
        role,
        1,
        parsedInitialPrice,
        initialPaymentTerms,
        initialPaymentMethod,
        initialDeliveryMethod,
        initialDeliveryCostBearer,
        parseInt(initialDeliveryDeadlineDays, 10) || 7,
        parseInt(initialInspectionWindowDays, 10) || 14,
        initialNotes || 'Initial baseline position created.',
        'submitted',
      ]
    );

    // Initial system announcement message
    await db.query(
      `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        roomId,
        'system',
        'DealPilot System',
        'system',
        `Negotiation room opened by ${req.user.name} (${role.toUpperCase()}). Initial offer posted at ${currency} ${parsedInitialPrice.toLocaleString()}.`,
        'system',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Negotiation room created successfully.',
      room: {
        id: roomId,
        roomCode,
        title,
        category,
        currency,
        initialPrice: parsedInitialPrice,
        status: 'active',
        agoraChannel,
      },
    });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ success: false, message: 'Server error creating negotiation room', error: err.message });
  }
});

// List rooms (Active rooms involving user or public explore rooms)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT r.*,
              u1.name as creator_name, u1.company as creator_company, u1.avatar_color as creator_color,
              u2.name as counterpart_name, u2.company as counterpart_company, u2.avatar_color as counterpart_color,
              (SELECT COUNT(*) FROM offers o WHERE o.room_id = r.id) as offer_count,
              (SELECT price FROM offers o WHERE o.room_id = r.id ORDER BY round_number DESC LIMIT 1) as latest_price
       FROM rooms r
       LEFT JOIN users u1 ON r.creator_id = u1.id
       LEFT JOIN users u2 ON r.counterpart_id = u2.id
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      rooms: result.rows,
    });
  } catch (err) {
    console.error('List rooms error:', err);
    res.status(500).json({ success: false, message: 'Server error listing rooms' });
  }
});

// Quick Room Code Lookup
router.get('/by-code/:code', authMiddleware, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const result = await db.query(
      `SELECT r.id, r.room_code, r.title, r.category, r.initial_price, r.status
       FROM rooms r WHERE UPPER(r.room_code) = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Room with code ${code} was not found.` });
    }

    res.json({ success: true, room: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error querying room code' });
  }
});

// Get Room Details (includes offers, messages, participants, agreement status)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomRes = await db.query(
      `SELECT r.*,
              u1.name as creator_name, u1.company as creator_company, u1.avatar_color as creator_color, u1.email as creator_email,
              u2.name as counterpart_name, u2.company as counterpart_company, u2.avatar_color as counterpart_color, u2.email as counterpart_email
       FROM rooms r
       LEFT JOIN users u1 ON r.creator_id = u1.id
       LEFT JOIN users u2 ON r.counterpart_id = u2.id
       WHERE r.id = $1`,
      [roomId]
    );

    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Negotiation room not found.' });
    }

    const room = roomRes.rows[0];

    // Determine current user's role in this room
    let userRole = 'observer';
    if (room.creator_id === req.user.id) {
      userRole = room.creator_role;
    } else if (room.counterpart_id === req.user.id) {
      userRole = room.creator_role === 'seller' ? 'buyer' : 'seller';
    } else if (!room.counterpart_id) {
      // Not yet joined, can join as opposite role
      userRole = room.creator_role === 'seller' ? 'buyer' : 'seller';
    }

    // Fetch offers
    const offersRes = await db.query(
      `SELECT o.*, u.name as sender_name, u.avatar_color as sender_color
       FROM offers o
       LEFT JOIN users u ON o.sender_id = u.id
       WHERE o.room_id = $1
       ORDER BY o.round_number ASC`,
      [roomId]
    );

    // Fetch messages
    const messagesRes = await db.query(
      `SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC`,
      [roomId]
    );

    // Fetch deal agreement if exists
    const dealRes = await db.query(
      `SELECT * FROM deal_agreements WHERE room_id = $1`,
      [roomId]
    );

    res.json({
      success: true,
      room,
      userRole,
      offers: offersRes.rows,
      messages: messagesRes.rows,
      dealAgreement: dealRes.rows[0] || null,
    });
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving room details' });
  }
});

// Join Room as Counterpart
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);

    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = roomRes.rows[0];

    if (room.creator_id === req.user.id) {
      return res.json({ success: true, message: 'You are the creator of this room.', role: room.creator_role });
    }

    if (room.counterpart_id && room.counterpart_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'This negotiation room already has two active negotiating parties.',
      });
    }

    const counterpartRole = room.creator_role === 'seller' ? 'buyer' : 'seller';

    if (!room.counterpart_id) {
      await db.query(
        `UPDATE rooms SET counterpart_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [req.user.id, roomId]
      );

      // System message
      await db.query(
        `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          roomId,
          'system',
          'DealPilot System',
          'system',
          `${req.user.name} joined as the ${counterpartRole.toUpperCase()}. Negotiation is now fully engaged.`,
          'system',
        ]
      );
    }

    res.json({
      success: true,
      message: `Joined room as ${counterpartRole.toUpperCase()}`,
      role: counterpartRole,
    });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ success: false, message: 'Server error joining room' });
  }
});

// Generate or Retrieve Official Commercial Quotation for Room
router.get('/:id/quotation', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const { generateCommercialQuotation } = require('../services/quotationService');

    const roomRes = await db.query(
      `SELECT r.*,
              u1.name as creator_name, u1.company as creator_company, u1.email as creator_email,
              u2.name as counterpart_name, u2.company as counterpart_company, u2.email as counterpart_email
       FROM rooms r
       LEFT JOIN users u1 ON r.creator_id = u1.id
       LEFT JOIN users u2 ON r.counterpart_id = u2.id
       WHERE r.id = $1`,
      [roomId]
    );

    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = roomRes.rows[0];

    // Fetch latest offer
    const offersRes = await db.query(
      `SELECT * FROM offers WHERE room_id = $1 ORDER BY round_number DESC LIMIT 1`,
      [roomId]
    );
    const latestOffer = offersRes.rows[0] || null;

    // Identify seller and buyer
    const isCreatorSeller = room.creator_role === 'seller';
    const seller = isCreatorSeller
      ? { name: room.creator_name, company: room.creator_company, email: room.creator_email }
      : { name: room.counterpart_name, company: room.counterpart_company, email: room.counterpart_email };

    const buyer = isCreatorSeller
      ? { name: room.counterpart_name, company: room.counterpart_company, email: room.counterpart_email }
      : { name: room.creator_name, company: room.creator_company, email: room.creator_email };

    const quotation = generateCommercialQuotation(room, latestOffer, seller, buyer);

    res.json({
      success: true,
      quotation,
    });
  } catch (err) {
    console.error('Quotation generation error:', err);
    res.status(500).json({ success: false, message: 'Error generating commercial quotation' });
  }
});

module.exports = router;
