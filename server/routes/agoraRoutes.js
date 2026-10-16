const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { generateRtcToken } = require('../services/agoraService');

// Get Agora RTC Voice Token for Room
router.get('/token', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = roomRes.rows[0];
    const channelName = room.agora_channel || `dealpilot_${room.id.replace(/-/g, '_')}`;

    // Generate a stable positive 32-bit numeric UID from user's id
    let numericUid = 0;
    for (let i = 0; i < req.user.id.length; i++) {
      numericUid = ((numericUid << 5) - numericUid + req.user.id.charCodeAt(i)) & 0x7fffffff;
    }
    if (numericUid === 0) numericUid = 12345;

    const tokenData = generateRtcToken(channelName, numericUid, 'publisher');

    res.json({
      success: true,
      data: {
        appId: tokenData.appId,
        channel: channelName,
        token: tokenData.token,
        uid: numericUid,
        userAccount: req.user.id,
        userName: req.user.name,
        expiresIn: tokenData.expiresIn,
        expiresAt: tokenData.expiresAt,
      },
    });
  } catch (err) {
    console.error('Agora Token generation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Agora RTC token',
      error: err.message,
    });
  }
});

module.exports = router;
