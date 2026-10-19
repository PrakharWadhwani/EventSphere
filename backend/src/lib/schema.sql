-- EventSphere schema (SQLite). Tag lists are stored as JSON arrays.

CREATE TABLE IF NOT EXISTS societies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  tags        TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  picture     TEXT,
  is_admin    INTEGER NOT NULL DEFAULT 0,
  society_id  TEXT REFERENCES societies(id),
  interests   TEXT NOT NULL DEFAULT '[]',
  onboarded   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  society_id        TEXT NOT NULL REFERENCES societies(id),
  category          TEXT NOT NULL CHECK (category IN ('Technical', 'Cultural', 'Workshops')),
  tags              TEXT NOT NULL DEFAULT '[]',
  banner_image_url  TEXT NOT NULL DEFAULT '',
  venue             TEXT NOT NULL,
  date              TEXT NOT NULL,          -- YYYY-MM-DD (campus local time)
  start_time        TEXT NOT NULL,          -- HH:MM
  end_time          TEXT NOT NULL,
  description       TEXT NOT NULL,
  registration_link TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('Draft', 'Published', 'Archived')),
  created_by        TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_feed ON events (status, date, start_time);
CREATE INDEX IF NOT EXISTS idx_events_society ON events (society_id);

CREATE TABLE IF NOT EXISTS follows (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  society_id TEXT NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, society_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_society ON follows (society_id);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint     TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription TEXT NOT NULL,              -- JSON PushSubscription
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
