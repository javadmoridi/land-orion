import Database from 'better-sqlite3';

const db = new Database('server/marketplace.db');

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_item REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'orion-token',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    seller_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    gross_amount REAL NOT NULL,
    tax_amount REAL NOT NULL,
    seller_amount REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id)
  );

  CREATE TABLE IF NOT EXISTS pending_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id TEXT NOT NULL,
    sale_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    claimed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    claimed_at TEXT,
    FOREIGN KEY (sale_id) REFERENCES sales(id)
  );

  CREATE INDEX IF NOT EXISTS idx_listings_status
    ON listings(status);

  CREATE INDEX IF NOT EXISTS idx_listings_item
    ON listings(item_type, item_id);

  CREATE INDEX IF NOT EXISTS idx_pending_seller
    ON pending_earnings(seller_id, claimed);
`);

export default db;