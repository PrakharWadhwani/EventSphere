// Regenerates data/db.json from the seed (dates relative to today).
import "dotenv/config";
import { loadDb, resetDb } from "../src/lib/db.js";

loadDb();
await resetDb();
console.log("Database reset with fresh seed data.");
