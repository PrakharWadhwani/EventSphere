import { db, toSociety, toEvent, getUserById } from "../lib/db.js";
import { publicUser } from "../lib/auth.js";
import { todayStr } from "./Events.js";

const SELECT_SOCIETIES = `SELECT s.*, (SELECT COUNT(*) FROM follows f WHERE f.society_id = s.id) AS followers
  FROM societies s`;

const withFollowers = (r) => r && { ...toSociety(r), followers: r.followers };

const followerCount = (societyId) =>
  db().prepare("SELECT COUNT(*) AS n FROM follows WHERE society_id = ?").get(societyId).n;

export const listSocieties = function (_req, res) {
  res.json({ societies: db().prepare(`${SELECT_SOCIETIES} ORDER BY s.name`).all().map(withFollowers) });
};

/** GET /societies/suggested?tags=Coding,Music — top 3 societies by tag overlap. */
export const suggestedSocieties = function (req, res) {
  const tags = String(req.query.tags || req.user?.interests?.join(",") || "")
    .split(",")
    .filter(Boolean);
  const ranked = db()
    .prepare(SELECT_SOCIETIES)
    .all()
    .map(withFollowers)
    .map((s) => ({ s, score: s.tags.filter((t) => tags.includes(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ s }) => s);
  res.json({ societies: ranked });
};

export const getSociety = function (req, res) {
  const society = withFollowers(db().prepare(`${SELECT_SOCIETIES} WHERE s.id = ?`).get(req.params.id));
  if (!society) return res.status(404).json({ error: "Society not found" });
  const events = db()
    .prepare(`SELECT e.*, s.name AS society_name FROM events e JOIN societies s ON s.id = e.society_id
      WHERE e.society_id = ? AND e.status = 'Published' AND e.date >= ? ORDER BY e.date, e.start_time`)
    .all(society.id, todayStr())
    .map(toEvent);
  res.json({ society, events });
};

export const followSociety = function (req, res) {
  const exists = db().prepare("SELECT 1 FROM societies WHERE id = ?").get(req.params.id);
  if (!exists) return res.status(404).json({ error: "Society not found" });
  db()
    .prepare("INSERT OR IGNORE INTO follows (user_id, society_id, created_at) VALUES (?, ?, ?)")
    .run(req.user.id, req.params.id, new Date().toISOString());
  res.json({ user: publicUser(getUserById(req.user.id)), followers: followerCount(req.params.id) });
};

export const unfollowSociety = function (req, res) {
  db().prepare("DELETE FROM follows WHERE user_id = ? AND society_id = ?").run(req.user.id, req.params.id);
  res.json({ user: publicUser(getUserById(req.user.id)), followers: followerCount(req.params.id) });
};
