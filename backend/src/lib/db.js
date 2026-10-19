import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";
import { buildSeed } from "./seed.js";

// SQLite via Node's built-in driver: no native modules to install.
// WAL mode lets reads continue while a write is in progress.
const DB_PATH = path.resolve(process.env.DB_PATH || "./data/eventsphere.db");
const SCHEMA = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "schema.sql"), "utf-8");

let conn = null;

export const newId = (prefix) => `${prefix}_${crypto.randomBytes(6).toString("hex")}`;

export function db() {
  if (!conn) loadDb();
  return conn;
}

export function loadDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  conn = new DatabaseSync(DB_PATH);
  conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");
  conn.exec(SCHEMA);
  const { n } = conn.prepare("SELECT COUNT(*) AS n FROM societies").get();
  if (n === 0) {
    seed();
    console.log(`Seeded new database at ${DB_PATH}`);
  }
  return conn;
}

/** Runs fn inside a transaction, rolling back on error. */
export function tx(fn) {
  const d = db();
  d.exec("BEGIN");
  try {
    const result = fn(d);
    d.exec("COMMIT");
    return result;
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

function seed() {
  const { societies, events } = buildSeed();
  tx((d) => {
    const s = d.prepare("INSERT INTO societies (id, name, description, tags) VALUES (?, ?, ?, ?)");
    societies.forEach((x) => s.run(x.id, x.name, x.description, JSON.stringify(x.tags)));
    const e = d.prepare(`INSERT INTO events (id, title, society_id, category, tags, banner_image_url, venue, date,
      start_time, end_time, description, registration_link, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`);
    events.forEach((x) =>
      e.run(x.id, x.title, x.societyId, x.category, JSON.stringify(x.tags), x.bannerImageUrl, x.venue, x.date,
        x.startTime, x.endTime, x.description, x.registrationLink, x.status, x.createdAt, x.updatedAt)
    );
  });
}

/** Drops all data and re-seeds (keeps the VAPID keys so push subscriptions survive). */
export function resetDb() {
  tx((d) => {
    d.exec("DELETE FROM push_subscriptions; DELETE FROM follows; DELETE FROM events; DELETE FROM users; DELETE FROM societies;");
  });
  seed();
}

// ---------- Row mappers (snake_case rows -> API objects) ----------

export const toSociety = (r) => r && { id: r.id, name: r.name, description: r.description, tags: JSON.parse(r.tags) };

export const toEvent = (r) =>
  r && {
    id: r.id,
    title: r.title,
    societyId: r.society_id,
    category: r.category,
    tags: JSON.parse(r.tags),
    bannerImageUrl: r.banner_image_url,
    venue: r.venue,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    description: r.description,
    registrationLink: r.registration_link,
    status: r.status,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    ...(r.society_name !== undefined && { society: { id: r.society_id, name: r.society_name } }),
  };

export const getUserById = (id) => {
  const r = db().prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!r) return null;
  const following = db()
    .prepare("SELECT society_id FROM follows WHERE user_id = ? ORDER BY created_at")
    .all(id)
    .map((f) => f.society_id);
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    picture: r.picture,
    isAdmin: !!r.is_admin,
    societyId: r.society_id,
    interests: JSON.parse(r.interests),
    onboarded: !!r.onboarded,
    following,
  };
};

export const getSetting = (key) => db().prepare("SELECT value FROM settings WHERE key = ?").get(key)?.value;
export const setSetting = (key, value) =>
  db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
