import { db, save, newId } from "../lib/db.js";
import { isKiitEmail, signToken, adminSocietyFor, publicUser } from "../lib/auth.js";
import { INTEREST_TAGS } from "../lib/seed.js";

const devLoginEnabled = () => process.env.ALLOW_DEV_LOGIN !== "false";

/** Verifies a Google ID token (from Google Identity Services) with Google's tokeninfo endpoint. */
async function verifyGoogleCredential(credential) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!res.ok) throw new Error("Invalid Google credential");
  const info = await res.json();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && info.aud !== clientId) throw new Error("Google credential was issued for another app");
  if (info.email_verified !== "true" && info.email_verified !== true) {
    throw new Error("Google email is not verified");
  }
  return { email: info.email, name: info.name, picture: info.picture };
}

/** Finds or creates the user and resolves their admin status. */
function upsertUser({ email, name, picture }, { asAdmin, societyId }) {
  const store = db();
  const normalized = email.toLowerCase().trim();
  let user = store.users.find((u) => u.email === normalized);
  if (!user) {
    user = {
      id: newId("usr"),
      email: normalized,
      name: name || normalized.split("@")[0],
      picture: picture || null,
      isAdmin: false,
      societyId: null,
      interests: [],
      following: [],
      onboarded: false,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  } else if (picture) {
    user.picture = picture;
  }

  if (asAdmin) {
    const configured = adminSocietyFor(normalized);
    const chosen = configured ?? (devLoginEnabled() ? societyId : undefined);
    if (!chosen || !store.societies.some((s) => s.id === chosen)) {
      const err = new Error("This account is not registered as a society representative.");
      err.status = 403;
      throw err;
    }
    user.isAdmin = true;
    user.societyId = chosen;
  }
  save();
  return user;
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

/** Email-only login for local development and demos (disable with ALLOW_DEV_LOGIN=false). */
export const devLogin = function (req, res) {
  if (!devLoginEnabled()) return res.status(404).json({ error: "Dev login is disabled" });
  try {
    const { email, name, asAdmin, societyId } = req.body || {};
    if (!email || !isKiitEmail(email)) {
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
  if (interests !== undefined) {
    if (!Array.isArray(interests) || interests.length < 3 || interests.length > 8) {
      return res.status(400).json({ error: "Select between 3 and 8 interest tags." });
    }
    const invalid = interests.filter((t) => !INTEREST_TAGS.includes(t));
    if (invalid.length) return res.status(400).json({ error: `Unknown tags: ${invalid.join(", ")}` });
    req.user.interests = [...new Set(interests)];
    req.user.onboarded = true;
  }
  if (typeof name === "string" && name.trim()) req.user.name = name.trim().slice(0, 80);
  save();
  res.json({ user: publicUser(req.user) });
};
