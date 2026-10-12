import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import appRouter from "./routes/appRouter.js";
import { loadDb } from "./lib/db.js";
import { initPush } from "./lib/push.js";

loadDb();
initPush();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
// Banner images are uploaded as data URLs, so allow a larger body.
app.use(express.json({ limit: "5mb" }));

app.use("/api/v1", appRouter);

// In production, serve the built frontend from the same origin.
const distDir = path.resolve(process.env.FRONTEND_DIST || "../Frontend/dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : "Internal server error" });
});

const PORT = process.env.PORT || 6767;

app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});
