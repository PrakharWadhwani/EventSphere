import { db, save, newId } from "../lib/db.js";
import { notifyFollowers } from "../lib/push.js";
import { CATEGORIES, INTEREST_TAGS } from "../lib/seed.js";

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const bySoonest = (a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime);

/** Adds the society name/id so the client never needs a second lookup. */
export function withSociety(event) {
  const society = db().societies.find((s) => s.id === event.societyId);
  return { ...event, society: society ? { id: society.id, name: society.name } : null };
}

/**
 * GET /events?q=&society=&date=&type=&includePast=
 * Published events only, soonest first. `date` = YYYY-MM-DD exact match,
 * or "today" / "week" shortcuts. `type` = category.
 */
export const listEvents = function (req, res) {
  const { q, society, date, type, includePast } = req.query;
  const store = db();
  const today = todayStr();
  let events = store.events.filter((e) => e.status === "Published");

  if (includePast !== "true") events = events.filter((e) => e.date >= today);
  if (society) events = events.filter((e) => e.societyId === society);
  if (type && type !== "All") events = events.filter((e) => e.category === type);
  if (date === "today") {
    events = events.filter((e) => e.date === today);
  } else if (date === "week") {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const endStr = end.toISOString().slice(0, 10);
    events = events.filter((e) => e.date <= endStr);
  } else if (date) {
    events = events.filter((e) => e.date === date);
  }
  if (q && q.trim()) {
    const terms = q.toLowerCase().trim().split(/\s+/);
    const names = new Map(store.societies.map((s) => [s.id, s.name.toLowerCase()]));
    events = events.filter((e) => {
      const haystack = `${e.title} ${names.get(e.societyId) || ""} ${e.tags.join(" ")}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }

  res.json({ events: events.sort(bySoonest).map(withSociety) });
};

/** GET /events/recommended — upcoming events ranked by tag overlap with the user's interests. */
export const recommendedEvents = function (req, res) {
  const interests = req.user?.interests || [];
  const following = req.user?.following || [];
  const today = todayStr();
  const scored = db()
    .events.filter((e) => e.status === "Published" && e.date >= today)
    .map((e) => ({
      e,
      score:
        e.tags.filter((t) => interests.includes(t)).length * 2 +
        (following.includes(e.societyId) ? 1 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || bySoonest(a.e, b.e))
    .slice(0, 9)
    .map(({ e }) => withSociety(e));
  res.json({ events: scored });
};

export const getEvent = function (req, res) {
  const event = db().events.find((e) => e.id === req.params.id);
  const canSeeDraft = req.user?.isAdmin && req.user.societyId === event?.societyId;
  if (!event || (event.status !== "Published" && !canSeeDraft)) {
    return res.status(404).json({ error: "Event not found" });
  }
  res.json({ event: withSociety(event) });
};

// ---------- Admin ----------

const isValidUrl = (u) => {
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

function validateEvent(body) {
  const errors = {};
  const str = (k, max = 200) => (typeof body[k] === "string" ? body[k].trim().slice(0, max) : "");
  const data = {
    title: str("title", 120),
    category: str("category"),
    bannerImageUrl: typeof body.bannerImageUrl === "string" ? body.bannerImageUrl : "",
    venue: str("venue", 120),
    date: str("date"),
    startTime: str("startTime"),
    endTime: str("endTime"),
    description: str("description", 3000),
    registrationLink: str("registrationLink", 500),
    status: body.status === "Draft" ? "Draft" : "Published",
    tags: Array.isArray(body.tags) ? body.tags.filter((t) => INTEREST_TAGS.includes(t)) : [],
  };
  if (!data.title) errors.title = "Title is required.";
  if (!CATEGORIES.includes(data.category)) errors.category = "Pick a valid category.";
  if (!data.venue) errors.venue = "Venue is required.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errors.date = "Date is required.";
  if (!/^\d{2}:\d{2}$/.test(data.startTime)) errors.startTime = "Start time is required.";
  if (!/^\d{2}:\d{2}$/.test(data.endTime)) errors.endTime = "End time is required.";
  else if (data.endTime <= data.startTime) errors.endTime = "End time must be after start time.";
  if (!data.description) errors.description = "Description is required.";
  if (!isValidUrl(data.registrationLink)) errors.registrationLink = "Enter a valid http(s) URL.";
  if (data.bannerImageUrl && !isValidUrl(data.bannerImageUrl) && !data.bannerImageUrl.startsWith("data:image/")) {
    errors.bannerImageUrl = "Banner must be an image URL or upload.";
  }
  if (data.bannerImageUrl.length > 4_000_000) errors.bannerImageUrl = "Banner image is too large (max ~3MB).";
  return { data, errors };
}

/** GET /admin/events — all events (drafts included) of the admin's society. */
export const adminListEvents = function (req, res) {
  const events = db()
    .events.filter((e) => e.societyId === req.user.societyId)
    .sort(bySoonest)
    .map(withSociety);
  res.json({ events });
};

export const createEvent = async function (req, res) {
  const { data, errors } = validateEvent(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", errors });

  const now = new Date().toISOString();
  const event = {
    id: newId("evt"),
    ...data,
    societyId: req.user.societyId,
    createdBy: req.user.id,
    createdAt: now,
    updatedAt: now,
  };
  db().events.push(event);
  save();

  const notified = event.status === "Published" ? await notifyFollowers(event) : 0;
  res.status(201).json({ event: withSociety(event), notified });
};

export const updateEvent = async function (req, res) {
  const event = db().events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (event.societyId !== req.user.societyId) {
    return res.status(403).json({ error: "You can only edit your own society's events" });
  }
  const { data, errors } = validateEvent({ ...event, ...req.body });
  if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", errors });

  const wasPublished = event.status === "Published";
  Object.assign(event, data, { updatedAt: new Date().toISOString() });
  save();

  // Only the Draft -> Published transition counts as a "new event" for followers.
  const notified = !wasPublished && event.status === "Published" ? await notifyFollowers(event) : 0;
  res.json({ event: withSociety(event), notified });
};

export const deleteEvent = function (req, res) {
  const store = db();
  const event = store.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (event.societyId !== req.user.societyId) {
    return res.status(403).json({ error: "You can only delete your own society's events" });
  }
  store.events = store.events.filter((e) => e.id !== event.id);
  save();
  res.status(204).end();
};
