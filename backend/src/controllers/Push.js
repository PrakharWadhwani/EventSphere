import { db } from "../lib/db.js";
import { getPublicKey } from "../lib/push.js";

export const publicKey = function (_req, res) {
  res.json({ publicKey: getPublicKey() });
};

export const subscribe = function (req, res) {
  const subscription = req.body?.subscription;
  if (typeof subscription?.endpoint !== "string" || !subscription.endpoint.startsWith("https://") || !subscription.keys) {
    return res.status(400).json({ error: "Invalid push subscription" });
  }
  // One row per browser endpoint; re-subscribing moves it to the current user.
  db()
    .prepare(`INSERT INTO push_subscriptions (endpoint, user_id, subscription, created_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, subscription = excluded.subscription`)
    .run(subscription.endpoint, req.user.id, JSON.stringify(subscription), new Date().toISOString());
  res.status(201).json({ ok: true });
};

export const unsubscribe = function (req, res) {
  const endpoint = req.body?.endpoint;
  if (endpoint) {
    db().prepare("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?").run(req.user.id, endpoint);
  } else {
    db().prepare("DELETE FROM push_subscriptions WHERE user_id = ?").run(req.user.id);
  }
  res.json({ ok: true });
};
