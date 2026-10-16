const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dealpilot-default-jwt-secret-key-321',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dealpilot',
  agora: {
    appId: process.env.AGORA_APP_ID || '',
    appCertificate: process.env.AGORA_APP_CERTIFICATE || '',
    tokenExpiration: parseInt(process.env.AGORA_TOKEN_EXPIRATION, 10) || 7200,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
};

module.exports = config;
