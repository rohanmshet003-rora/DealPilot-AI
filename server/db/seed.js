const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('./index');

async function seed(force = false) {
  console.log('[Database] Checking seed status...');
  if (!force) {
    const existingUsers = await db.query('SELECT COUNT(*) as cnt FROM users');
    const count = parseInt(existingUsers.rows[0].cnt || existingUsers.rows[0].count || 0, 10);

    if (count > 0) {
      console.log('[Database] Seed data already present. Skipping.');
      return;
    }
  }

  console.log('[Database] Seeding DealPilot AI demo accounts and Indian Rupee (₹) negotiation rooms...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Seed Users (Indian Enterprise Context)
  const user1Id = 'usr-seller-001';
  const user2Id = 'usr-buyer-002';
  const user3Id = 'usr-vendor-003';

  await db.query('DELETE FROM users WHERE id IN ($1, $2, $3)', [user1Id, user2Id, user3Id]);

  await db.query(
    `INSERT INTO users (id, name, email, password_hash, company, role_preference, avatar_color)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user1Id, 'Sarah Jenkins', 'seller@dealpilot.ai', passwordHash, 'Apex Cloud Technologies Pvt Ltd', 'seller', '#10B981']
  );

  await db.query(
    `INSERT INTO users (id, name, email, password_hash, company, role_preference, avatar_color)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user2Id, 'Alex Morgan', 'buyer@dealpilot.ai', passwordHash, 'Horizon Dynamics India Ltd', 'buyer', '#3B82F6']
  );

  await db.query(
    `INSERT INTO users (id, name, email, password_hash, company, role_preference, avatar_color)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user3Id, 'Marcus Vance', 'vendor@dealpilot.ai', passwordHash, 'Vance Industrial Precision Works', 'seller', '#8B5CF6']
  );

  // 2. Seed Room 1: Enterprise AI Cloud GPU Cluster (₹7,50,000)
  const room1Id = 'room-gpu-cluster-01';
  await db.query('DELETE FROM rooms WHERE id = $1', [room1Id]);
  await db.query(
    `INSERT INTO rooms (id, room_code, title, category, description, currency, creator_id, creator_role, counterpart_id, initial_price, target_price, status, agora_channel)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      room1Id,
      'DP-8801',
      'Enterprise AI Cloud GPU Cluster (12-Month SLA)',
      'Software & SaaS',
      'Dedicated cluster of 32x H100 SXM5 GPUs hosted in Mumbai data center, 99.99% uptime guarantee, custom VPC interconnect, and 24/7 dedicated engineering support.',
      'INR',
      user1Id,
      'seller',
      user2Id,
      750000,
      650000,
      'active',
      'dealpilot_channel_dp8801',
    ]
  );

  // Round 1 (Seller initial offer): ₹7,50,000
  await db.query(
    `INSERT INTO offers (id, room_id, sender_id, sender_role, round_number, price, payment_terms, payment_method, delivery_method, delivery_cost_bearer, delivery_deadline_days, inspection_window_days, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      'off-001',
      room1Id,
      user1Id,
      'seller',
      1,
      750000,
      '100% Upfront via NEFT / RTGS',
      'NEFT / RTGS Bank Transfer',
      'Digital Instant Handover / VPC Provision',
      'Seller Pays',
      3,
      14,
      'Standard enterprise contract rate with SLA tier-1 escalation and GST invoice.',
      'countered',
    ]
  );

  // Round 2 (Buyer counter): ₹6,20,000
  await db.query(
    `INSERT INTO offers (id, room_id, sender_id, sender_role, round_number, price, payment_terms, payment_method, delivery_method, delivery_cost_bearer, delivery_deadline_days, inspection_window_days, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      'off-002',
      room1Id,
      user2Id,
      'buyer',
      2,
      620000,
      '50% Advance via UPI/NEFT, 50% on Milestone',
      'UPI / Corporate Net Banking',
      'Digital Instant Handover / VPC Provision',
      'Seller Pays',
      5,
      30,
      'Our approved FY procurement budget is constrained; 50/50 milestones required for internal finance release.',
      'countered',
    ]
  );

  // Round 3 (Seller counter): ₹6,85,000
  await db.query(
    `INSERT INTO offers (id, room_id, sender_id, sender_role, round_number, price, payment_terms, payment_method, delivery_method, delivery_cost_bearer, delivery_deadline_days, inspection_window_days, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      'off-003',
      room1Id,
      user1Id,
      'seller',
      3,
      685000,
      '50% Advance, 50% on Verification',
      'NEFT / RTGS Bank Transfer',
      'Digital Instant Handover / VPC Provision',
      'Seller Pays',
      3,
      21,
      'Conceding to 50/50 milestone payment and offering ₹6,85,000 if deal is signed this week.',
      'submitted',
    ]
  );

  // Messages for Room 1
  const messages = [
    { sender: user1Id, name: 'Sarah Jenkins', role: 'seller', text: 'Namaste Alex! We are ready to provision the GPU cluster with Mumbai data center latency once terms are approved.' },
    { sender: user2Id, name: 'Alex Morgan', role: 'buyer', text: 'Thank you Sarah. The benchmark looks solid. Our procurement committee requires 50/50 milestone payments to clear the purchase order.' },
    { sender: user1Id, name: 'Sarah Jenkins', role: 'seller', text: 'Understood. We are happy to agree to 50/50 milestones if we settle near ₹6,85,000 with GST input tax credit invoice provided.' },
    { sender: user2Id, name: 'Alex Morgan', role: 'buyer', text: 'Checking Gemini AI Copilot now to evaluate the counteroffer and generate the commercial quotation.' },
  ];

  for (const msg of messages) {
    await db.query(
      `INSERT INTO messages (id, room_id, sender_id, sender_name, sender_role, content, message_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), room1Id, msg.sender, msg.name, msg.role, msg.text, 'chat']
    );
  }

  // 3. Seed Room 2: Industrial 5-Axis CNC Milling Workstation (₹18,50,000)
  const room2Id = 'room-cnc-mill-02';
  await db.query('DELETE FROM rooms WHERE id = $1', [room2Id]);
  await db.query(
    `INSERT INTO rooms (id, room_code, title, category, description, currency, creator_id, creator_role, counterpart_id, initial_price, target_price, status, agora_channel)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      room2Id,
      'DP-4209',
      'Precision 5-Axis CNC Machining Center (With Tooling)',
      'Equipment & Machinery',
      'Industrial grade 5-axis vertical machining center with 24-station automatic tool changer, Renishaw probing, and 1-year factory warranty. Ready for dispatch from Pune.',
      'INR',
      user3Id,
      'seller',
      null,
      1850000,
      1650000,
      'active',
      'dealpilot_channel_dp4209',
    ]
  );

  // 4. Seed Room 3: Commercial Office Floor Lease (₹1,25,000/mo)
  const room3Id = 'room-lease-03';
  await db.query('DELETE FROM rooms WHERE id = $1', [room3Id]);
  await db.query(
    `INSERT INTO rooms (id, room_code, title, category, description, currency, creator_id, creator_role, counterpart_id, initial_price, target_price, status, agora_channel)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      room3Id,
      'DP-9310',
      'Prime IT Corridor Office Floor (3,500 sq ft, 3-Yr Lease)',
      'Real Estate',
      'Fully furnished tech park commercial floor in Whitefield, Bengaluru with 60 workstations, 2 conference rooms, 100% power backup, and 8 reserved car parking slots.',
      'INR',
      user1Id,
      'seller',
      null,
      125000,
      110000,
      'active',
      'dealpilot_channel_dp9310',
    ]
  );

  console.log('[Database] Indian Rupee (₹) seed data successfully populated.');
}

module.exports = { seed };
