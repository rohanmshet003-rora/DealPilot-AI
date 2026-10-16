-- DealPilot AI - PostgreSQL Database Schema
-- Brand Tagline: "Negotiate Smarter. Deal Better. Close with Confidence."

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role_preference VARCHAR(32) DEFAULT 'both',
    avatar_color VARCHAR(32) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    room_code VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    currency VARCHAR(16) DEFAULT 'INR',
    creator_id VARCHAR(64) NOT NULL REFERENCES users(id),
    creator_role VARCHAR(16) NOT NULL,
    counterpart_id VARCHAR(64) REFERENCES users(id),
    initial_price NUMERIC(14, 2) NOT NULL,
    target_price NUMERIC(14, 2),
    status VARCHAR(32) DEFAULT 'active',
    agora_channel VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL REFERENCES users(id),
    sender_role VARCHAR(16) NOT NULL,
    round_number INT NOT NULL,
    price NUMERIC(14, 2) NOT NULL,
    payment_terms VARCHAR(128) NOT NULL,
    payment_method VARCHAR(128) NOT NULL,
    delivery_method VARCHAR(128) NOT NULL,
    delivery_cost_bearer VARCHAR(64) NOT NULL,
    delivery_deadline_days INT NOT NULL,
    inspection_window_days INT NOT NULL,
    notes TEXT,
    status VARCHAR(32) DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(32) DEFAULT 'chat',
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deal_agreements (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) UNIQUE NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    accepted_offer_id VARCHAR(64) NOT NULL REFERENCES offers(id),
    seller_signed BOOLEAN DEFAULT FALSE,
    seller_signed_at TIMESTAMP WITH TIME ZONE,
    seller_signature_name VARCHAR(255),
    buyer_signed BOOLEAN DEFAULT FALSE,
    buyer_signed_at TIMESTAMP WITH TIME ZONE,
    buyer_signature_name VARCHAR(255),
    deal_certificate_hash VARCHAR(128),
    final_terms_json TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'pending_signatures',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compromises (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    package_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    proposed_price NUMERIC(14, 2) NOT NULL,
    payment_terms VARCHAR(128) NOT NULL,
    delivery_method VARCHAR(128) NOT NULL,
    delivery_cost_bearer VARCHAR(64) NOT NULL,
    delivery_deadline_days INT,
    inspection_window_days INT,
    concessions_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_offers_room ON offers(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_agreements_room ON deal_agreements(room_id);
