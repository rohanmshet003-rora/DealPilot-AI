const express = require('express');
const router = express.Router({ mergeParams: true });
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Submit Offer or Counteroffer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const {
      price,
      paymentTerms,
      paymentMethod,
      deliveryMethod,
      deliveryCostBearer,
      deliveryDeadlineDays,
      inspectionWindowDays,
      notes,
    } = req.body;

    if (!price || !paymentTerms || !deliveryMethod) {
      return res.status(400).json({
        success: false,
        message: 'Price, payment terms, and delivery method are required.',
      });
    }

    // Verify room
    const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const room = roomRes.rows[0];

    // Determine sender role
    let senderRole = 'buyer';
    if (room.creator_id === req.user.id) {
      senderRole = room.creator_role;
    } else if (room.counterpart_id === req.user.id) {
      senderRole = room.creator_role === 'seller' ? 'buyer' : 'seller';
    } else if (!room.counterpart_id) {
      // Auto-join as counterpart if open
      senderRole = room.creator_role === 'seller' ? 'buyer' : 'seller';
      await db.query('UPDATE rooms SET counterpart_id = $1 WHERE id = $2', [req.user.id, roomId]);
    }

    // Get current round count
    const roundsRes = await db.query('SELECT MAX(round_number) as max_round FROM offers WHERE room_id = $1', [roomId]);
    const nextRound = (parseInt(roundsRes.rows[0]?.max_round || 0, 10)) + 1;

    // Mark previous active offers as countered
    await db.query(
      `UPDATE offers SET status = 'countered' WHERE room_id = $1 AND status = 'submitted'`,
      [roomId]
    );

    const offerId = uuidv4();
    const parsedPrice = parseFloat(price);

    await db.query(
      `INSERT INTO offers (
        id, room_id, sender_id, sender_role, round_number, price,
        payment_terms, payment_method, delivery_method, delivery_cost_bearer,
        delivery_deadline_days, inspection_window_days, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        offerId,
        roomId,
        req.user.id,
        senderRole,
        nextRound,
        parsedPrice,
        paymentTerms,
        paymentMethod || 'Bank Wire Transfer',
        deliveryMethod,
        deliveryCostBearer || '50/50 Split',
        parseInt(deliveryDeadlineDays, 10) || 7,
        parseInt(inspectionWindowDays, 10) || 14,
        notes?.trim() || `Round ${nextRound} offer from ${senderRole}`,
        'submitted',
      ]
    );

    // Update room status
    await db.query(
      `UPDATE rooms SET status = 'offer_pending', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [roomId]
    );

    // System announcement message
    await db.query(
      `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        roomId,
        'system',
        'DealPilot System',
        'system',
        `Round ${nextRound} ${nextRound === 1 ? 'Offer' : 'Counteroffer'} submitted by ${req.user.name} (${senderRole.toUpperCase()}) for ${room.currency} ${parsedPrice.toLocaleString()}.`,
        'offer_alert',
      ]
    );

    const createdOfferRes = await db.query(
      `SELECT o.*, u.name as sender_name, u.avatar_color as sender_color
       FROM offers o LEFT JOIN users u ON o.sender_id = u.id WHERE o.id = $1`,
      [offerId]
    );

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully.',
      offer: createdOfferRes.rows[0],
    });
  } catch (err) {
    console.error('Submit offer error:', err);
    res.status(500).json({ success: false, message: 'Server error submitting offer', error: err.message });
  }
});

// Accept an Offer
router.post('/:offerId/accept', authMiddleware, async (req, res) => {
  try {
    const { roomId, offerId } = req.params;

    const offerRes = await db.query('SELECT * FROM offers WHERE id = $1 AND room_id = $2', [offerId, roomId]);
    if (offerRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const offer = offerRes.rows[0];

    // Prevent accepting one's own offer
    if (offer.sender_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot accept your own offer. You must wait for your counterpart to accept or counter.',
      });
    }

    // Mark offer accepted
    await db.query(`UPDATE offers SET status = 'accepted' WHERE id = $1`, [offerId]);

    // Mark room agreed
    await db.query(`UPDATE rooms SET status = 'agreed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [roomId]);

    // Construct agreement JSON snapshot
    const agreementSnapshot = {
      offerId: offer.id,
      roundNumber: offer.round_number,
      finalPrice: parseFloat(offer.price),
      paymentTerms: offer.payment_terms,
      paymentMethod: offer.payment_method,
      deliveryMethod: offer.delivery_method,
      deliveryCostBearer: offer.delivery_cost_bearer,
      deliveryDeadlineDays: offer.delivery_deadline_days,
      inspectionWindowDays: offer.inspection_window_days,
      notes: offer.notes,
      agreedAt: new Date().toISOString(),
    };

    const certHash = crypto.createHash('sha256').update(JSON.stringify(agreementSnapshot) + roomId).digest('hex').substring(0, 24).toUpperCase();
    const agreementId = uuidv4();

    // Upsert deal agreement
    await db.query(
      `INSERT INTO deal_agreements (id, room_id, accepted_offer_id, final_terms_json, deal_certificate_hash, status)
       VALUES ($1, $2, $3, $4, $5, 'pending_signatures')
       ON CONFLICT (room_id) DO UPDATE SET
         accepted_offer_id = $3,
         final_terms_json = $4,
         deal_certificate_hash = $5,
         status = 'pending_signatures',
         updated_at = CURRENT_TIMESTAMP`,
      [agreementId, roomId, offerId, JSON.stringify(agreementSnapshot), `DP-CERT-${certHash}`]
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
        `Deal terms agreed! ${req.user.name} accepted Round ${offer.round_number} offer ($${parseFloat(offer.price).toLocaleString()}). Both parties are now requested to digitally sign the Final Deal Summary.`,
        'system',
      ]
    );

    res.json({
      success: true,
      message: 'Offer accepted! Bilateral deal agreement initiated.',
      dealAgreement: {
        id: agreementId,
        roomId,
        status: 'pending_signatures',
        dealCertificateHash: `DP-CERT-${certHash}`,
        terms: agreementSnapshot,
      },
    });
  } catch (err) {
    console.error('Accept offer error:', err);
    res.status(500).json({ success: false, message: 'Server error accepting offer', error: err.message });
  }
});

// Reject an Offer
router.post('/:offerId/reject', authMiddleware, async (req, res) => {
  try {
    const { roomId, offerId } = req.params;
    await db.query(`UPDATE offers SET status = 'rejected' WHERE id = $1 AND room_id = $2`, [offerId, roomId]);

    await db.query(
      `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        roomId,
        'system',
        'DealPilot System',
        'system',
        `${req.user.name} declined the current offer. The negotiation remains open for a revised proposal.`,
        'system',
      ]
    );

    res.json({ success: true, message: 'Offer marked as declined.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error declining offer' });
  }
});

module.exports = router;
