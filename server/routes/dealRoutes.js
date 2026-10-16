const express = require('express');
const router = express.Router({ mergeParams: true });
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get Deal Agreement Status
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const agreementRes = await db.query(
      `SELECT da.*,
              r.title as room_title, r.category as room_category, r.currency as room_currency,
              u1.name as creator_name, u2.name as counterpart_name
       FROM deal_agreements da
       JOIN rooms r ON da.room_id = r.id
       LEFT JOIN users u1 ON r.creator_id = u1.id
       LEFT JOIN users u2 ON r.counterpart_id = u2.id
       WHERE da.room_id = $1`,
      [roomId]
    );

    if (agreementRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active deal agreement exists for this room yet. An offer must be accepted first.',
      });
    }

    const agreement = agreementRes.rows[0];
    let terms = {};
    try {
      terms = typeof agreement.final_terms_json === 'string'
        ? JSON.parse(agreement.final_terms_json)
        : agreement.final_terms_json;
    } catch (e) {
      terms = {};
    }

    res.json({
      success: true,
      dealAgreement: {
        ...agreement,
        terms,
        isFullyExecuted: Boolean(agreement.seller_signed && agreement.buyer_signed),
      },
    });
  } catch (err) {
    console.error('Fetch deal error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving deal agreement' });
  }
});

// Sign Deal Agreement (Seller or Buyer)
router.post('/sign', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { signatureName } = req.body;

    const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const room = roomRes.rows[0];

    const agreementRes = await db.query('SELECT * FROM deal_agreements WHERE room_id = $1', [roomId]);
    if (agreementRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Deal agreement not found' });
    }
    const agreement = agreementRes.rows[0];

    // Determine user role
    let isSeller = false;
    let isBuyer = false;

    if (room.creator_id === req.user.id) {
      if (room.creator_role === 'seller') isSeller = true;
      else isBuyer = true;
    } else if (room.counterpart_id === req.user.id) {
      if (room.creator_role === 'seller') isBuyer = true;
      else isSeller = true;
    } else {
      return res.status(403).json({ success: false, message: 'You are not a recognized negotiating party for this deal.' });
    }

    const signName = signatureName?.trim() || req.user.name;
    const now = new Date().toISOString();

    let updatedSellerSigned = Boolean(agreement.seller_signed);
    let updatedSellerSignedAt = agreement.seller_signed_at;
    let updatedSellerSignName = agreement.seller_signature_name;

    let updatedBuyerSigned = Boolean(agreement.buyer_signed);
    let updatedBuyerSignedAt = agreement.buyer_signed_at;
    let updatedBuyerSignName = agreement.buyer_signature_name;

    if (isSeller) {
      updatedSellerSigned = true;
      updatedSellerSignedAt = now;
      updatedSellerSignName = signName;
    } else if (isBuyer) {
      updatedBuyerSigned = true;
      updatedBuyerSignedAt = now;
      updatedBuyerSignName = signName;
    }

    const bothSigned = updatedSellerSigned && updatedBuyerSigned;
    const newStatus = bothSigned ? 'fully_executed' : 'pending_signatures';

    // Generate certified hash
    const certHash = crypto
      .createHash('sha256')
      .update(`${agreement.id}-${roomId}-${updatedSellerSignedAt}-${updatedBuyerSignedAt}-${agreement.final_terms_json}`)
      .digest('hex')
      .substring(0, 24)
      .toUpperCase();

    const certId = `DP-CERT-${certHash}`;

    // Update agreement in DB
    await db.query(
      `UPDATE deal_agreements
       SET seller_signed = $1,
           seller_signed_at = $2,
           seller_signature_name = $3,
           buyer_signed = $4,
           buyer_signed_at = $5,
           buyer_signature_name = $6,
           status = $7,
           deal_certificate_hash = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE room_id = $9`,
      [
        updatedSellerSigned ? 1 : 0,
        updatedSellerSignedAt,
        updatedSellerSignName,
        updatedBuyerSigned ? 1 : 0,
        updatedBuyerSignedAt,
        updatedBuyerSignName,
        newStatus,
        certId,
        roomId,
      ]
    );

    // If both parties have signed, lock room status to 'finalized'
    if (bothSigned) {
      await db.query(`UPDATE rooms SET status = 'finalized', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [roomId]);

      await db.query(
        `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          roomId,
          'system',
          'DealPilot System',
          'system',
          `🎉 DEAL FULLY EXECUTED & CERTIFIED! Both ${updatedSellerSignName} (Seller) and ${updatedBuyerSignName} (Buyer) have signed the agreement. Certificate: ${certId}.`,
          'system',
        ]
      );
    } else {
      await db.query(
        `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          roomId,
          'system',
          'DealPilot System',
          'system',
          `Digital signature recorded by ${signName} (${isSeller ? 'Seller' : 'Buyer'}). Awaiting counterpart signature.`,
          'system',
        ]
      );
    }

    res.json({
      success: true,
      message: bothSigned ? 'Deal fully executed and certified!' : 'Signature recorded successfully.',
      bothSigned,
      certificateHash: certId,
    });
  } catch (err) {
    console.error('Sign deal error:', err);
    res.status(500).json({ success: false, message: 'Server error signing deal agreement', error: err.message });
  }
});

// Get Certified Deal Certificate Details (Print/Export Data)
router.get('/certificate', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const resData = await db.query(
      `SELECT da.*,
              r.title as room_title, r.category as room_category, r.currency as room_currency, r.description as room_description,
              u1.name as creator_name, u1.company as creator_company, u1.email as creator_email,
              u2.name as counterpart_name, u2.company as counterpart_company, u2.email as counterpart_email
       FROM deal_agreements da
       JOIN rooms r ON da.room_id = r.id
       LEFT JOIN users u1 ON r.creator_id = u1.id
       LEFT JOIN users u2 ON r.counterpart_id = u2.id
       WHERE da.room_id = $1`,
      [roomId]
    );

    if (resData.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate data not found.' });
    }

    const cert = resData.rows[0];
    const terms = JSON.parse(cert.final_terms_json || '{}');

    res.json({
      success: true,
      certificate: {
        certificateId: cert.deal_certificate_hash,
        status: cert.status,
        roomTitle: cert.room_title,
        category: cert.room_category,
        currency: cert.room_currency,
        seller: {
          name: cert.seller_signature_name || cert.creator_name,
          company: cert.creator_company,
          signed: Boolean(cert.seller_signed),
          signedAt: cert.seller_signed_at,
        },
        buyer: {
          name: cert.buyer_signature_name || cert.counterpart_name,
          company: cert.counterpart_company,
          signed: Boolean(cert.buyer_signed),
          signedAt: cert.buyer_signed_at,
        },
        finalTerms: terms,
        certificationAuthority: 'DealPilot AI Cryptographic Verification Protocol v2.5',
        timestamp: cert.updated_at || new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ success: false, message: 'Error generating certificate view' });
  }
});

module.exports = router;
