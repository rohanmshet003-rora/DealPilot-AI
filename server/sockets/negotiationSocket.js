const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('../db');

function setupSockets(io) {
  // Map of active calls: roomId -> Set of user UIDs
  const roomVoiceParticipants = new Map();

  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    socket.on('join_room', async ({ roomId, user }) => {
      currentRoomId = roomId;
      currentUser = user;
      socket.join(roomId);

      // Notify room of presence
      socket.to(roomId).emit('user_joined_room', {
        userId: user?.id,
        userName: user?.name,
        role: user?.role,
      });

      // Send existing active voice callers in this room
      const activeVoice = Array.from(roomVoiceParticipants.get(roomId) || []);
      socket.emit('active_voice_participants', { participants: activeVoice });
    });

    socket.on('leave_room', ({ roomId, user }) => {
      socket.leave(roomId);
      if (roomVoiceParticipants.has(roomId) && user?.id) {
        roomVoiceParticipants.get(roomId).delete(user.id);
      }
      socket.to(roomId).emit('user_left_room', { userId: user?.id });
    });

    // Chat Message
    socket.on('send_message', async ({ roomId, senderId, senderName, senderRole, content }) => {
      try {
        if (!content || !content.trim()) return;

        const messageId = uuidv4();
        await db.query(
          `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
           VALUES ($1, $2, $3, $4, $5, $6, 'chat')`,
          [messageId, roomId, senderId, senderName, senderRole, content.trim()]
        );

        const newMsg = {
          id: messageId,
          room_id: roomId,
          sender_id: senderId,
          sender_name: senderName,
          sender_role: senderRole,
          content: content.trim(),
          message_type: 'chat',
          created_at: new Date().toISOString(),
        };

        io.to(roomId).emit('new_message', newMsg);
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // Voice Call state updates (Agora)
    socket.on('voice_call_joined', ({ roomId, userId, userName, userRole }) => {
      if (!roomVoiceParticipants.has(roomId)) {
        roomVoiceParticipants.set(roomId, new Set());
      }
      roomVoiceParticipants.get(roomId).add(userId);

      io.to(roomId).emit('voice_call_user_joined', {
        userId,
        userName,
        userRole,
        totalInCall: roomVoiceParticipants.get(roomId).size,
      });
    });

    socket.on('voice_call_left', ({ roomId, userId }) => {
      if (roomVoiceParticipants.has(roomId)) {
        roomVoiceParticipants.get(roomId).delete(userId);
      }
      io.to(roomId).emit('voice_call_user_left', {
        userId,
        totalInCall: roomVoiceParticipants.get(roomId)?.size || 0,
      });
    });

    socket.on('voice_mic_toggled', ({ roomId, userId, isMuted }) => {
      socket.to(roomId).emit('voice_mic_state_changed', { userId, isMuted });
    });

    // Offer Broadcasts
    socket.on('offer_submitted', ({ roomId, offer }) => {
      io.to(roomId).emit('offer_received', { offer });
    });

    socket.on('offer_accepted', ({ roomId, offerId, agreement }) => {
      io.to(roomId).emit('offer_accepted_broadcast', { offerId, agreement });
    });

    socket.on('deal_signed', ({ roomId, signerRole, bothSigned, certificateHash }) => {
      io.to(roomId).emit('deal_signed_broadcast', { signerRole, bothSigned, certificateHash });
    });

    socket.on('disconnect', () => {
      if (currentRoomId && currentUser?.id) {
        if (roomVoiceParticipants.has(currentRoomId)) {
          roomVoiceParticipants.get(currentRoomId).delete(currentUser.id);
          io.to(currentRoomId).emit('voice_call_user_left', {
            userId: currentUser.id,
            totalInCall: roomVoiceParticipants.get(currentRoomId).size,
          });
        }
      }
    });
  });
}

module.exports = setupSockets;
