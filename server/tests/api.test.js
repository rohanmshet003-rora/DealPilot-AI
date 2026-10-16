const request = require('supertest');
const { app } = require('../index');
const { initDb } = require('../db');
const { seed } = require('../db/seed');

jest.setTimeout(30000);

let authToken = '';
let testRoomId = '';

beforeAll(async () => {
  await initDb();
  await seed();

  // Login as demo buyer
  const res = await request(app)
    .post('/api/auth/demo-login')
    .send({ role: 'buyer' });
  authToken = res.body.token;
}, 30000);

describe('DealPilot AI API Suite', () => {
  test('Health check endpoint returns status ok and branding tagline', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.tagline).toBe('Negotiate Smarter. Deal Better. Close with Confidence.');
    expect(res.body.agoraConfigured).toBe(true);
    expect(res.body.geminiConfigured).toBe(true);
  });

  test('User authentication profile endpoint returns user info and stats', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('buyer@dealpilot.ai');
    expect(res.body.stats).toBeDefined();
  });

  test('Lists negotiation rooms', async () => {
    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.rooms)).toBe(true);
    expect(res.body.rooms.length).toBeGreaterThan(0);
    testRoomId = res.body.rooms[0].id;
  });

  test('Creates a new negotiation room', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Enterprise Server Fleet Acquisition',
        category: 'Equipment & Machinery',
        description: 'Rackmount high density AI inference servers with redundant PSUs.',
        initialPrice: 54000,
        currency: 'USD',
        creatorRole: 'buyer',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.room.roomCode).toMatch(/^DP-\d+/);
  });

  test('Generates an Agora RTC voice token for live voice calls', async () => {
    const res = await request(app)
      .get(`/api/rooms/${testRoomId}/agora/token`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.appId).toBeDefined();
    expect(res.body.data.channel).toBeDefined();
  });

  test('Retrieves AI strategic negotiation analysis', async () => {
    const res = await request(app)
      .get(`/api/rooms/${testRoomId}/ai/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis).toBeDefined();
    expect(res.body.analysis.leverageScore).toBeGreaterThanOrEqual(0);
    expect(res.body.analysis.tacticalPosture).toBeDefined();
  });

  test('Generates intelligent multi-attribute compromise suggestions', async () => {
    const res = await request(app)
      .get(`/api/rooms/${testRoomId}/ai/compromises`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.packages.length).toBe(3);
    expect(res.body.packages[0].packageType).toBe('balanced');
  });

  test('Submits a counteroffer in a negotiation room', async () => {
    const res = await request(app)
      .post(`/api/rooms/${testRoomId}/offers`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        price: 84000,
        paymentTerms: '50% Upfront, 50% on Delivery',
        paymentMethod: 'Bank Wire Transfer',
        deliveryMethod: 'Express Air',
        deliveryCostBearer: '50/50 Split',
        deliveryDeadlineDays: 5,
        inspectionWindowDays: 14,
        notes: 'Updated counteroffer with split logistics.',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.offer.price)).toBe(84000);
  });
});
