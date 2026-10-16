const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

let pool = null;
let sqliteDb = null;
let adapter = 'none';

async function initDb() {
  // First, attempt PostgreSQL connection
  if (config.databaseUrl) {
    try {
      // Auto-strip accidental placeholder brackets: postgres:[password]@ -> postgres:password@
      let cleanUrl = config.databaseUrl;
      if (cleanUrl.includes(':[') && cleanUrl.includes(']@')) {
        cleanUrl = cleanUrl.replace(':[', ':').replace(']@', '@');
      }

      const isRemote = !cleanUrl.includes('localhost') && !cleanUrl.includes('127.0.0.1');
      const poolConfig = {
        connectionString: cleanUrl,
        connectionTimeoutMillis: 10000,
      };

      if (isRemote) {
        poolConfig.ssl = { rejectUnauthorized: false };
      }

      const testPool = new Pool(poolConfig);

      const client = await testPool.connect();
      await client.query('SELECT 1');
      client.release();

      pool = testPool;
      adapter = 'postgres';
      console.log(`[Database] Successfully connected to PostgreSQL via ${cleanUrl.replace(/:[^:]*@/, ':****@')}`);
      await createTablesPostgres();
      return { adapter: 'postgres' };
    } catch (pgErr) {
      console.warn(`[Database] PostgreSQL not accessible (${pgErr.message}). Automatically initializing persistent SQLite fallback for DealPilot AI.`);
    }
  }

  // Fallback to SQLite (ensures 100% reliable local setup and zero crash)
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'dealpilot.db');
    sqliteDb = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('[Database] Failed to initialize SQLite database:', err);
        return reject(err);
      }
      adapter = 'sqlite';
      console.log(`[Database] Persistent SQLite database initialized at ${dbPath}`);
      try {
        await runSqlite(`PRAGMA journal_mode = WAL;`);
        await runSqlite(`PRAGMA foreign_keys = ON;`);
        await createTablesSqlite();
        resolve({ adapter: 'sqlite' });
      } catch (tableErr) {
        reject(tableErr);
      }
    });
  });
}

function runSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function allSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function createTablesPostgres() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(ddl);
  console.log('[Database] PostgreSQL tables verified.');
}

async function createTablesSqlite() {
  const createStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      company TEXT,
      role_preference TEXT DEFAULT 'both',
      avatar_color TEXT DEFAULT '#3B82F6',
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      currency TEXT DEFAULT 'USD',
      creator_id TEXT NOT NULL REFERENCES users(id),
      creator_role TEXT NOT NULL,
      counterpart_id TEXT REFERENCES users(id),
      initial_price REAL NOT NULL,
      target_price REAL,
      status TEXT DEFAULT 'active',
      agora_channel TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id),
      sender_role TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      price REAL NOT NULL,
      payment_terms TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      delivery_method TEXT NOT NULL,
      delivery_cost_bearer TEXT NOT NULL,
      delivery_deadline_days INTEGER NOT NULL,
      inspection_window_days INTEGER NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'submitted',
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'chat',
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS deal_agreements (
      id TEXT PRIMARY KEY,
      room_id TEXT UNIQUE NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      accepted_offer_id TEXT NOT NULL REFERENCES offers(id),
      seller_signed INTEGER DEFAULT 0,
      seller_signed_at TEXT,
      seller_signature_name TEXT,
      buyer_signed INTEGER DEFAULT 0,
      buyer_signed_at TEXT,
      buyer_signature_name TEXT,
      deal_certificate_hash TEXT,
      final_terms_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending_signatures',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS compromises (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      package_type TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      proposed_price REAL NOT NULL,
      payment_terms TEXT NOT NULL,
      delivery_method TEXT NOT NULL,
      delivery_cost_bearer TEXT NOT NULL,
      delivery_deadline_days INTEGER,
      inspection_window_days INTEGER,
      concessions_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
  ];

  for (const stmt of createStatements) {
    await runSqlite(stmt);
  }
  console.log('[Database] SQLite tables verified.');
}

/**
 * Universal Query Method
 * Converts $1, $2, ... placeholders to ? when SQLite is active
 */
async function query(sql, params = []) {
  if (adapter === 'postgres') {
    const res = await pool.query(sql, params);
    return { rows: res.rows, rowCount: res.rowCount };
  } else if (adapter === 'sqlite') {
    let sqliteSql = sql.replace(/\$(\d+)/g, '?');
    
    // Check if SELECT statement
    const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqliteSql);
    if (isSelect) {
      const rows = await allSqlite(sqliteSql, params);
      return { rows, rowCount: rows.length };
    } else {
      const res = await runSqlite(sqliteSql, params);
      return { rows: [], rowCount: res.changes, lastID: res.lastID };
    }
  } else {
    throw new Error('Database not initialized. Call initDb() first.');
  }
}

function getAdapter() {
  return adapter;
}

module.exports = {
  initDb,
  query,
  getAdapter,
};
