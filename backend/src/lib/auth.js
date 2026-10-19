import jwt from "jsonwebtoken";
import { getUserById } from "./db.js";

const ALLOWED_DOMAIN = "kiit.ac.in";
const DEV_SECRET = "eventsphere-dev-secret-change-me";

export const isProduction = () => process.env.NODE_ENV === "production";

/** Dev login defaults to on locally and off in production; ALLOW_DEV_LOGIN overrides either way. */
export const devLoginEnabled = () =>
  process.env.ALLOW_DEV_LOGIN ? process.env.ALLOW_DEV_LOGIN === "true" : !isProduction();

const jwtSecret = () => process.env.JWT_SECRET || DEV_SECRET;

/** Refuses to start in production with unsafe settings. Returns warnings for dev. */
export function checkAuthConfig() {
  const problems = [];
  if (isProduction()) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      problems.push("JWT_SECRET must be set to a random string of at least 32 characters.");
    }
    if (!process.env.GOOGLE_CLIENT_ID && !devLoginEnabled()) {
      problems.push("Set GOOGLE_CLIENT_ID (or ALLOW_DEV_LOGIN=true for a demo) so users can log in.");
    }
    if (problems.length) throw new Error(`Unsafe production config:\n - ${problems.join("\n - ")}`);
  }
  const warnings = [];
  if (!process.env.JWT_SECRET) warnings.push("JWT_SECRET not set; using an insecure development secret.");
  if (devLoginEnabled()) warnings.push("Dev login is ON: anyone can sign in as any @kiit.ac.in email.");
  return warnings;
}

export const isKiitEmail = (email = "") =>
  email.toLowerCase().trim().endsWith(`@${ALLOWED_DOMAIN}`);

export const signToken = (user) =>
  jwt.sign({ sub: user.id }, jwtSecret(), { expiresIn: "7d" });

/** Attaches req.user when a valid Bearer token is present. */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const { sub } = jwt.verify(token, jwtSecret());
      req.user = getUserById(sub);
    } catch {
      req.user = null;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    next();
  });
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Admin access required" });
    next();
  });
}

/**
 * ADMIN_EMAILS="lead@kiit.ac.in:soc_krs,other@kiit.ac.in:soc_fed"
 * Maps society-rep emails to the society they manage.
 */
export function adminSocietyFor(email) {
  const entries = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const entry of entries) {
    const [e, societyId] = entry.split(":");
    if (e.toLowerCase() === email.toLowerCase()) return societyId || null;
  }
  return undefined;
}

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  picture: u.picture || null,
  isAdmin: !!u.isAdmin,
  societyId: u.societyId || null,
  interests: u.interests || [],
  following: u.following || [],
  onboarded: !!u.onboarded,
});
