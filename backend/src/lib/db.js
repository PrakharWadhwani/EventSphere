import fs from "fs";
import path from "path";
import crypto from "crypto";
import { buildSeed } from "./seed.js";

// Lightweight JSON-file store. Good enough for the MVP demo (20+ concurrent users):
// all reads hit memory, writes are flushed to disk asynchronously and serialized.
const DB_PATH = path.resolve(process.env.DB_PATH || "./data/db.json");

let state = null;
let writeQueue = Promise.resolve();

export const newId = (prefix) => `${prefix}_${crypto.randomBytes(6).toString("hex")}`;

export function loadDb() {
  if (fs.existsSync(DB_PATH)) {
    state = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } else {
    state = buildSeed();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
    console.log(`Seeded new database at ${DB_PATH}`);
  }
  state.users ??= [];
  state.pushSubscriptions ??= [];
  return state;
}

export function db() {
  if (!state) loadDb();
  return state;
}

export function save() {
  const snapshot = JSON.stringify(state, null, 2);
  writeQueue = writeQueue
    .then(() => fs.promises.writeFile(DB_PATH, snapshot))
    .catch((err) => console.error("Failed to persist DB:", err));
  return writeQueue;
}

export function resetDb() {
  state = buildSeed();
  return save();
}
