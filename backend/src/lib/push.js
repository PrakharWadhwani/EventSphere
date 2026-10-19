import webpush from "web-push";
import { db, getSetting, setSetting } from "./db.js";

let publicKey = null;

/**
 * Configures Web Push with VAPID keys from env, or generates a pair once and
 * persists it in the DB so existing browser subscriptions stay valid.
 */
export function initPush() {
  let keys =
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
      ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
      : JSON.parse(getSetting("vapidKeys") || "null");
  if (!keys) {
    keys = webpush.generateVAPIDKeys();
    setSetting("vapidKeys", JSON.stringify(keys));
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:eventsphere@kiit.ac.in",
    keys.publicKey,
    keys.privateKey
  );
  publicKey = keys.publicKey;
}

export const getPublicKey = () => publicKey;

/** Sends a "new event" push to every follower of the event's society. Returns devices reached. */
export async function notifyFollowers(event) {
  const targets = db()
    .prepare(`SELECT p.endpoint, p.subscription FROM push_subscriptions p
      JOIN follows f ON f.user_id = p.user_id WHERE f.society_id = ?`)
    .all(event.societyId);
  if (targets.length === 0) return 0;

  const payload = JSON.stringify({
    title: `New event from ${event.society?.name || "a society you follow"}`,
    body: `${event.title} · ${event.date} at ${event.venue}`,
    url: `/events/${event.id}`,
    icon: "/favicon.svg",
  });

  let delivered = 0;
  const expired = [];
  await Promise.all(
    targets.map((t) =>
      webpush
        .sendNotification(JSON.parse(t.subscription), payload, { TTL: 60 * 60 * 24 })
        .then(() => delivered++)
        .catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) expired.push(t.endpoint);
          else console.warn("Push failed:", err.statusCode || err.message);
        })
    )
  );
  const del = db().prepare("DELETE FROM push_subscriptions WHERE endpoint = ?");
  expired.forEach((e) => del.run(e));
  return delivered;
}
