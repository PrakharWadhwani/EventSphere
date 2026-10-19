import { db, newId, toEvent } from "../lib/db.js";
import { notifyFollowers } from "../lib/push.js";
import { CATEGORIES, INTEREST_TAGS } from "../lib/seed.js";
import { isDataImage, checkDataImage, saveDataImage, removeUpload, UPLOAD_PREFIX } from "../lib/uploads.js";

const pad = (n) => String(n).padStart(2, "0");
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Today's date in the server's timezone (TZ defaults to Asia/Kolkata, see lib/env.js). */
export const todayStr = () => localDate(new Date());

export const STATUSES = ["Draft", "Published", "Archived"];

// Every event query joins the society so the client never needs a second lookup.
const SELECT_EVENTS = `SELECT e.*, s.name AS society_name FROM events e JOIN societies s ON s.id = e.society_id`;
const ORDER_SOONEST = `ORDER BY e.date, e.start_time`;

export const findEvent = (id) => toEvent(db().prepare(`${SELECT_EVENTS} WHERE e.id = ?`).get(id));

/**
 * GET /events?q=&society=&date=&type=&includePast=
 * Published events only, soonest first. `date` = YYYY-MM-DD exact match,
 * or "today" / "week" shortcuts. `type` = category.
 */
export const listEvents = function (req, res) {
  const { q, society, date, type, includePast } = req.query;
  const where = ["e.status = 'Published'"];
  const params = [];
  const today = todayStr();

  if (includePast !== "true") {
    where.push("e.date >= ?");
    params.push(today);
  }
  if (society) {
    where.push("e.society_id = ?");
    params.push(String(society));
  }
  if (type && type !== "All") {
    where.push("e.category = ?");
    params.push(String(type));
  }
  if (date === "today") {
    where.push("e.date = ?");
    params.push(today);
  } else if (date === "week") {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    where.push("e.date <= ?");
    params.push(localDate(end));
  } else if (date) {
    where.push("e.date = ?");
    params.push(String(date));
  }
  // Every search word must appear in the title, society name or tags.
  if (typeof q === "string" && q.trim()) {
    for (const term of q.toLowerCase().trim().split(/\s+/).slice(0, 8)) {
      where.push(`(lower(e.title) LIKE ? ESCAPE '\\' OR lower(s.name) LIKE ? ESCAPE '\\' OR lower(e.tags) LIKE ? ESCAPE '\\')`);
      const like = `%${term.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
      params.push(like, like, like);
    }
  }

  const rows = db().prepare(`${SELECT_EVENTS} WHERE ${where.join(" AND ")} ${ORDER_SOONEST}`).all(...params);
  res.json({ events: rows.map(toEvent) });
};

/** GET /events/recommended — upcoming events ranked by tag overlap with the user's interests. */
export const recommendedEvents = function (req, res) {
  const interests = req.user.interests || [];
  const following = new Set(req.user.following || []);
  const rows = db()
    .prepare(`${SELECT_EVENTS} WHERE e.status = 'Published' AND e.date >= ? ${ORDER_SOONEST}`)
    .all(todayStr());
  const ranked = rows
    .map(toEvent)
    .map((e) => ({
      e,
      score: e.tags.filter((t) => interests.includes(t)).length * 2 + (following.has(e.societyId) ? 1 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score) // stable sort keeps soonest-first within a score
    .slice(0, 9)
    .map(({ e }) => e);
  res.json({ events: ranked });
};

export const getEvent = function (req, res) {
  const event = findEvent(req.params.id);
  const isOwner = req.user?.isAdmin && req.user.societyId === event?.societyId;
  if (!event || (event.status !== "Published" && !isOwner)) {
    return res.status(404).json({ error: "Event not found" });
  }
  res.json({ event });
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
    status: STATUSES.includes(body.status) ? body.status : "Published",
    tags: Array.isArray(body.tags) ? [...new Set(body.tags.filter((t) => INTEREST_TAGS.includes(t)))] : [],
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
  const banner = data.bannerImageUrl;
  if (banner) {
    if (isDataImage(banner)) {
      const problem = checkDataImage(banner);
      if (problem) errors.bannerImageUrl = problem;
    } else if (!isValidUrl(banner) && !banner.startsWith(UPLOAD_PREFIX)) {
      errors.bannerImageUrl = "Banner must be an image URL or upload.";
    }
  }
  return { data, errors };
}

const failed = (res, errors) => res.status(400).json({ error: "Validation failed", errors });

/** GET /admin/events — all events (drafts and archived included) of the admin's society. */
export const adminListEvents = function (req, res) {
  const rows = db().prepare(`${SELECT_EVENTS} WHERE e.society_id = ? ${ORDER_SOONEST}`).all(req.user.societyId);
  res.json({ events: rows.map(toEvent) });
};

function writeEvent(id, data, { isNew, userId, societyId }) {
  const now = new Date().toISOString();
  const values = [
    data.title, data.category, JSON.stringify(data.tags), data.bannerImageUrl, data.venue, data.date,
    data.startTime, data.endTime, data.description, data.registrationLink, data.status, now,
  ];
  if (isNew) {
    db().prepare(`INSERT INTO events (title, category, tags, banner_image_url, venue, date, start_time, end_time,
      description, registration_link, status, updated_at, id, society_id, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(...values, id, societyId, userId, now);
  } else {
    db().prepare(`UPDATE events SET title = ?, category = ?, tags = ?, banner_image_url = ?, venue = ?, date = ?,
      start_time = ?, end_time = ?, description = ?, registration_link = ?, status = ?, updated_at = ?
      WHERE id = ?`).run(...values, id);
  }
}

export const createEvent = async function (req, res) {
  const { data, errors } = validateEvent(req.body || {});
  if (Object.keys(errors).length) return failed(res, errors);
  if (isDataImage(data.bannerImageUrl)) data.bannerImageUrl = saveDataImage(data.bannerImageUrl);

  const id = newId("evt");
  writeEvent(id, data, { isNew: true, userId: req.user.id, societyId: req.user.societyId });
  const event = findEvent(id);
  const notified = event.status === "Published" ? await notifyFollowers(event) : 0;
  res.status(201).json({ event, notified });
};

export const updateEvent = async function (req, res) {
  const existing = findEvent(req.params.id);
  if (!existing) return res.status(404).json({ error: "Event not found" });
  if (existing.societyId !== req.user.societyId) {
    return res.status(403).json({ error: "You can only edit your own society's events" });
  }
  const { data, errors } = validateEvent({ ...existing, ...req.body });
  if (Object.keys(errors).length) return failed(res, errors);
  if (isDataImage(data.bannerImageUrl)) data.bannerImageUrl = saveDataImage(data.bannerImageUrl);
  if (data.bannerImageUrl !== existing.bannerImageUrl) removeUpload(existing.bannerImageUrl);

  writeEvent(existing.id, data, { isNew: false });
  const event = findEvent(existing.id);
  // Only the Draft -> Published transition counts as a "new event" for followers.
  const notified = existing.status === "Draft" && event.status === "Published" ? await notifyFollowers(event) : 0;
  res.json({ event, notified });
};

export const deleteEvent = function (req, res) {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (event.societyId !== req.user.societyId) {
    return res.status(403).json({ error: "You can only delete your own society's events" });
  }
  db().prepare("DELETE FROM events WHERE id = ?").run(event.id);
  removeUpload(event.bannerImageUrl);
  res.status(204).end();
};
