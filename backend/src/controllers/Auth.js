import { db, newId, getUserById } from "../lib/db.js";
import { isKiitEmail, signToken, adminSocietyFor, publicUser, devLoginEnabled } from "../lib/auth.js";
import { INTEREST_TAGS } from "../lib/seed.js";

/** Verifies a Google ID token (from Google Identity Services) with Google's tokeninfo endpoint. */
async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  // Without a client ID we can't check the token's audience, so a token minted for any
  // other Google app would be accepted. Refuse instead.
  if (!clientId) {
    const err = new Error("Google login is not configured on this server.");
    err.status = 503;
    throw err;
  }
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!res.ok) throw new Error("Invalid Google credential");
  const info = await res.json();
  if (info.aud !== clientId) throw new Error("Google credential was issued for another app");
  if (info.email_verified !== "true" && info.email_verified !== true) {
    throw new Error("Google email is not verified");
  }
  return { email: info.email, name: info.name, picture: info.picture };
}

/** Finds or creates the user and resolves their admin status. */
function upsertUser({ email, name, picture }, { asAdmin, societyId }) {
  const d = db();
  const normalized = email.toLowerCase().trim();
  let row = d.prepare("SELECT id FROM users WHERE email = ?").get(normalized);
  if (!row) {
    row = { id: newId("usr") };
    d.prepare(
      "INSERT INTO users (id, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(row.id, normalized, name || normalized.split("@")[0], picture || null, new Date().toISOString());
  } else if (picture) {
    d.prepare("UPDATE users SET picture = ? WHERE id = ?").run(picture, row.id);
  }

  if (asAdmin) {
    const configured = adminSocietyFor(normalized);
    const chosen = configured ?? (devLoginEnabled() ? societyId : undefined);
    const exists = chosen && d.prepare("SELECT 1 FROM societies WHERE id = ?").get(chosen);
    if (!exists) {
      const err = new Error("This account is not registered as a society representative.");
      err.status = 403;
      throw err;
    }
    d.prepare("UPDATE users SET is_admin = 1, society_id = ? WHERE id = ?").run(chosen, row.id);
  }
  return getUserById(row.id);
}

const respond = (res, user) => res.json({ token: signToken(user), user: publicUser(user) });

export const googleLogin = async function (req, res) {
  try {
    const { credential, asAdmin, societyId } = req.body || {};
    if (!credential) return res.status(400).json({ error: "Missing Google credential" });
    const profile = await verifyGoogleCredential(credential);
    if (!isKiitEmail(profile.email)) {
      return res.status(403).json({ error: "Access restricted: only @kiit.ac.in accounts are allowed." });
    }
    respond(res, upsertUser(profile, { asAdmin, societyId }));
  } catch (error) {
    res.status(error.status || 401).json({ error: error.message });
  }
};

/** Email-only login for local development and demos. */
export const devLogin = function (req, res) {
  if (!devLoginEnabled()) return res.status(404).json({ error: "Dev login is disabled" });
  try {
    const { email, name, asAdmin, societyId } = req.body || {};
    if (typeof email !== "string" || !isKiitEmail(email)) {
      return res.status(403).json({ error: "Access restricted: only @kiit.ac.in accounts are allowed." });
    }
    respond(res, upsertUser({ email, name }, { asAdmin, societyId }));
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

export const authConfig = function (_req, res) {
  res.json({
    devLoginEnabled: devLoginEnabled(),
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    interestTags: INTEREST_TAGS,
  });
};

export const getMe = function (req, res) {
  res.json({ user: publicUser(req.user) });
};

export const updateMe = function (req, res) {
  const { interests, name } = req.body || {};
  const d = db();
  if (interests !== undefined) {
    if (!Array.isArray(interests) || interests.length < 3 || interests.length > 8) {
      return res.status(400).json({ error: "Select between 3 and 8 interest tags." });
    }
    const invalid = interests.filter((t) => !INTEREST_TAGS.includes(t));
    if (invalid.length) return res.status(400).json({ error: `Unknown tags: ${invalid.join(", ")}` });
    d.prepare("UPDATE users SET interests = ?, onboarded = 1 WHERE id = ?").run(
      JSON.stringify([...new Set(interests)]),
      req.user.id
    );
  }
  if (typeof name === "string" && name.trim()) {
    d.prepare("UPDATE users SET name = ? WHERE id = ?").run(name.trim().slice(0, 80), req.user.id);
  }
  res.json({ user: publicUser(getUserById(req.user.id)) });
};
