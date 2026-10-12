import webpush from "web-push";
import { db, save } from "./db.js";

let publicKey = null;

/**
 * Configures Web Push with VAPID keys from env, or generates a pair once and
 * persists it in the DB so existing browser subscriptions stay valid.
 */
export function initPush() {
  const store = db();
  let keys =
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
      ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
      : store.vapidKeys;
  if (!keys) {
    keys = webpush.generateVAPIDKeys();
    store.vapidKeys = keys;
    save();
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:eventsphere@kiit.ac.in",
    keys.publicKey,
    keys.privateKey
  );
  publicKey = keys.publicKey;
}

export const getPublicKey = () => publicKey;

/** Sends a "new event" push to every follower of the event's society. */
export async function notifyFollowers(event) {
  const store = db();
  const society = store.societies.find((s) => s.id === event.societyId);
  const followerIds = new Set(
    store.users.filter((u) => (u.following || []).includes(event.societyId)).map((u) => u.id)
  );
  const targets = store.pushSubscriptions.filter((s) => followerIds.has(s.userId));
  if (targets.length === 0) return 0;

  const payload = JSON.stringify({
    title: `New event from ${society?.name || "a society you follow"}`,
    body: `${event.title} · ${event.date} at ${event.venue}`,
    url: `/events/${event.id}`,
    icon: "/favicon.svg",
  });

  const expired = [];
  await Promise.all(
    targets.map((t) =>
      webpush.sendNotification(t.subscription, payload).catch((err) => {
        if (err.statusCode === 404 || err.statusCode === 410) expired.push(t.subscription.endpoint);
        else console.warn("Push failed:", err.statusCode || err.message);
      })
    )
  );
  if (expired.length) {
    store.pushSubscriptions = store.pushSubscriptions.filter(
      (s) => !expired.includes(s.subscription.endpoint)
    );
    save();
  }
  return targets.length - expired.length;
}
