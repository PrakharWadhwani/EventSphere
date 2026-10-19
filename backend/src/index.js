import "./lib/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import path from "path";
import fs from "fs";
import appRouter from "./routes/appRouter.js";
import { loadDb } from "./lib/db.js";
import { initPush } from "./lib/push.js";
import { checkAuthConfig, isProduction } from "./lib/auth.js";
import { UPLOAD_DIR } from "./lib/uploads.js";

try {
  checkAuthConfig().forEach((w) => console.warn(`[warn] ${w}`));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

loadDb();
initPush();

const app = express();
// Behind Render/Railway/Nginx the client IP comes from X-Forwarded-For (needed for rate limiting).
if (isProduction()) app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https://accounts.google.com/gsi/client"],
        "frame-src": ["'self'", "https://accounts.google.com/gsi/"],
        "connect-src": ["'self'", "https://accounts.google.com/gsi/"],
        "style-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com/gsi/style"],
        "img-src": ["'self'", "data:", "https:"],
        // HTTPS hosts redirect anyway; upgrading breaks plain-http local testing.
        "upgrade-insecure-requests": null,
      },
    },
    // Google Sign-In opens a popup that must be able to message this window.
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
// Banner images are uploaded as data URLs, so allow a larger body.
app.use(express.json({ limit: "5mb" }));

const limiter = (limit, windowMs = 15 * 60 * 1000) =>
  rateLimit({ windowMs, limit, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many requests, slow down." } });
// Limits are per IP. A whole classroom on campus Wi-Fi can share one IP, so keep them generous.
const LOGIN_LIMIT = Number(process.env.LOGIN_RATE_LIMIT) || 200;
app.use("/api/v1/auth/google", limiter(LOGIN_LIMIT));
app.use("/api/v1/auth/dev-login", limiter(LOGIN_LIMIT));
app.use("/api/v1/admin", limiter(300));
app.use("/api/v1", limiter(Number(process.env.RATE_LIMIT_PER_MIN) || 3000, 60 * 1000));

app.use("/api/v1", appRouter);
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d", immutable: true }));

// In production, serve the built frontend from the same origin.
const distDir = path.resolve(process.env.FRONTEND_DIST || "../Frontend/dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Upload is too large." });
  console.error(err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : "Internal server error" });
});

const PORT = process.env.PORT || 6767;

app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});
