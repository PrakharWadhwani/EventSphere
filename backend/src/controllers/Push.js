import { db, save } from "../lib/db.js";
import { getPublicKey } from "../lib/push.js";

export const publicKey = function (_req, res) {
  res.json({ publicKey: getPublicKey() });
};

export const subscribe = function (req, res) {
  const subscription = req.body?.subscription;
  if (!subscription?.endpoint || !subscription?.keys) {
    return res.status(400).json({ error: "Invalid push subscription" });
  }
  const store = db();
  store.pushSubscriptions = store.pushSubscriptions.filter(
    (s) => s.subscription.endpoint !== subscription.endpoint
  );
  store.pushSubscriptions.push({ userId: req.user.id, subscription, createdAt: new Date().toISOString() });
  save();
  res.status(201).json({ ok: true });
};

export const unsubscribe = function (req, res) {
  const endpoint = req.body?.endpoint;
  const store = db();
  store.pushSubscriptions = store.pushSubscriptions.filter(
    (s) => !(s.userId === req.user.id && (!endpoint || s.subscription.endpoint === endpoint))
  );
  save();
  res.json({ ok: true });
};
