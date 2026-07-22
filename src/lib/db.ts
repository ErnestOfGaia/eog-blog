import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), 'data', 'blog.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initSchema(db)
  return db
}

// Greenfield schema (design plan 04 §3.3). No legacy migrations — this DB starts
// clean. All timestamps are ISO8601 UTC (datetime('now')); convert to the display
// timezone only at the edges (guard against the main site's TZ bug).
function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      slug                 TEXT NOT NULL UNIQUE,
      title                TEXT NOT NULL,
      body                 TEXT NOT NULL,
      excerpt              TEXT,
      tags                 TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)),
      cover_image          TEXT,
      cover_image_alt      TEXT,
      status               TEXT NOT NULL DEFAULT 'draft'
                             CHECK (status IN
                               ('draft','pending_review','changes_requested','approved','published')),
      author               TEXT NOT NULL DEFAULT 'ernest',
      review_notes         TEXT,
      seo_title            TEXT,
      seo_description      TEXT,
      canonical_url        TEXT,
      discuss_linkedin_url TEXT,
      publish_at           TEXT,
      published_at         TEXT,
      created_at           TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_content_status            ON content(status);
    CREATE INDEX IF NOT EXISTS idx_content_published_at      ON content(published_at);
    CREATE INDEX IF NOT EXISTS idx_content_status_publish_at ON content(status, publish_at);

    -- keep updated_at honest on any write path; WHEN guard prevents recursion
    CREATE TRIGGER IF NOT EXISTS trg_content_updated_at
    AFTER UPDATE ON content FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN
      UPDATE content SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `)
}
