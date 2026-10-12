import { db, save } from "../lib/db.js";
import { publicUser } from "../lib/auth.js";
import { withSociety, todayStr } from "./Events.js";

const followerCount = (societyId) =>
  db().users.filter((u) => (u.following || []).includes(societyId)).length;

const summarize = (s) => ({ ...s, followers: followerCount(s.id) });

export const listSocieties = function (_req, res) {
  res.json({ societies: db().societies.map(summarize) });
};

/** GET /societies/suggested?tags=Coding,Music — top 3 societies by tag overlap. */
export const suggestedSocieties = function (req, res) {
  const tags = String(req.query.tags || req.user?.interests?.join(",") || "")
    .split(",")
    .filter(Boolean);
  const ranked = db()
    .societies.map((s) => ({ s, score: s.tags.filter((t) => tags.includes(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ s }) => summarize(s));
  res.json({ societies: ranked });
};

export const getSociety = function (req, res) {
  const store = db();
  const society = store.societies.find((s) => s.id === req.params.id);
  if (!society) return res.status(404).json({ error: "Society not found" });
  const today = todayStr();
  const events = store.events
    .filter((e) => e.societyId === society.id && e.status === "Published" && e.date >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .map(withSociety);
  res.json({ society: summarize(society), events });
};

export const followSociety = function (req, res) {
  const society = db().societies.find((s) => s.id === req.params.id);
  if (!society) return res.status(404).json({ error: "Society not found" });
  req.user.following = [...new Set([...(req.user.following || []), society.id])];
  save();
  res.json({ user: publicUser(req.user), followers: followerCount(society.id) });
};

export const unfollowSociety = function (req, res) {
  req.user.following = (req.user.following || []).filter((id) => id !== req.params.id);
  save();
  res.json({ user: publicUser(req.user), followers: followerCount(req.params.id) });
};
