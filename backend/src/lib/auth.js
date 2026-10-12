import jwt from "jsonwebtoken";
import { db } from "./db.js";

const JWT_SECRET = () => process.env.JWT_SECRET || "eventsphere-dev-secret-change-me";
const ALLOWED_DOMAIN = "kiit.ac.in";

export const isKiitEmail = (email = "") =>
  email.toLowerCase().trim().endsWith(`@${ALLOWED_DOMAIN}`);

export const signToken = (user) =>
  jwt.sign({ sub: user.id }, JWT_SECRET(), { expiresIn: "7d" });

/** Attaches req.user when a valid Bearer token is present. */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const { sub } = jwt.verify(token, JWT_SECRET());
      req.user = db().users.find((u) => u.id === sub) || null;
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
