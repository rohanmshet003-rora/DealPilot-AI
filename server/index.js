const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const config = require('./config/env');
const { initDb, getAdapter } = require('./db');
const { seed } = require('./db/seed');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const offerRoutes = require('./routes/offerRoutes');
const aiRoutes = require('./routes/aiRoutes');
const agoraRoutes = require('./routes/agoraRoutes');
const dealRoutes = require('./routes/dealRoutes');
const setupSockets = require('./sockets/negotiationSocket');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSockets(io);

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Attach io to req for endpoints if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'DealPilot AI Server',
    tagline: 'Negotiate Smarter. Deal Better. Close with Confidence.',
    version: '1.0.0',
    databaseAdapter: getAdapter(),
    agoraConfigured: Boolean(config.agora.appId && config.agora.appCertificate),
    geminiConfigured: Boolean(config.gemini.apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms/:roomId/offers', offerRoutes);
app.use('/api/rooms/:roomId/ai', aiRoutes);
app.use('/api/rooms/:roomId/agora', agoraRoutes);
app.use('/api/rooms/:roomId/deal', dealRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[DealPilot Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server after Database Initialization
async function startServer() {
  try {
    await initDb();
    await seed();

    server.listen(config.port, () => {
      console.log('====================================================');
      console.log('  🚀 DealPilot AI Server Running');
      console.log(`  🌐 Port: ${config.port}`);
      console.log(`  🔗 Health: http://localhost:${config.port}/api/health`);
      console.log(`  🎙️ Agora Voice Engine: ${config.agora.appId ? 'Configured' : 'Missing credentials'}`);
      console.log(`  🧠 Google Gemini SDK: ${config.gemini.apiKey ? 'Configured' : 'Missing API key'}`);
      console.log('  "Negotiate Smarter. Deal Better. Close with Confidence."');
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Fatal Server Boot Error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
