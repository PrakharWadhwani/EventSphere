// Wipes all data and re-seeds (dates relative to today). Stop the server first.
import "../src/lib/env.js";
import { loadDb, resetDb } from "../src/lib/db.js";

loadDb();
resetDb();
console.log("Database reset with fresh seed data.");
