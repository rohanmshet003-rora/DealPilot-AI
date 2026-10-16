import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function RoomChat({
  roomId,
  messages = [],
  currentUser,
  userRole = 'buyer',
  onSendMessage,
}) {
  const { socket } = useSocket();
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (onSendMessage) {
      onSendMessage(inputText.trim());
    } else if (socket) {
      socket.emit('send_message', {
        roomId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: userRole,
        content: inputText.trim(),
      });
    }

    setInputText('');
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--accent-sky)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>In-Room Negotiation Chat</h4>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          Real-Time Sync
        </span>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto' }}>
            No chat messages yet. Send a message to coordinate terms or request a clarification.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSystem = msg.sender_id === 'system' || msg.message_type === 'system' || msg.message_type === 'offer_alert';
            const isMe = msg.sender_id === currentUser?.id;
            const isBuyer = msg.sender_role === 'buyer';

            if (isSystem) {
              return (
                <div key={msg.id || idx} style={{ textAlign: 'center', margin: '0.35rem 0' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <AlertCircle size={12} color="var(--accent-sky)" />
                    <span>{msg.content}</span>
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id || idx}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{msg.sender_name}</span>
                  <span className={`badge ${isBuyer ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {msg.sender_role}
                  </span>
                </div>

                <div
                  style={{
                    background: isMe
                      ? 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)'
                      : 'rgba(30, 41, 59, 0.8)',
                    border: isMe ? 'none' : '1px solid var(--border-subtle)',
                    borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '0.65rem 0.95rem',
                    fontSize: '0.875rem',
                    lineHeight: 1.45,
                    color: '#FFFFFF',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <input
          type="text"
          placeholder="Type message to negotiating counterpart..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="form-input"
          style={{ flex: 1, fontSize: '0.875rem' }}
        />
        <button type="submit" disabled={!inputText.trim()} className="btn btn-primary btn-sm">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
