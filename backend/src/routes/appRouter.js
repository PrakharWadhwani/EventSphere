import express from "express";
import { AuthRouter } from "./authRoutes/authRouter.js";
import { optionalAuth, requireAuth, requireAdmin } from "../lib/auth.js";
import {
  listEvents, recommendedEvents, getEvent,
  adminListEvents, createEvent, updateEvent, deleteEvent,
} from "../controllers/Events.js";
import {
  listSocieties, suggestedSocieties, getSociety, followSociety, unfollowSociety,
} from "../controllers/Societies.js";
import { publicKey, subscribe, unsubscribe } from "../controllers/Push.js";

const appRouter = express.Router();

appRouter.get("/health", (_req, res) => res.json({ ok: true }));
appRouter.use("/auth", AuthRouter);

appRouter.get("/events", listEvents);
appRouter.get("/events/recommended", requireAuth, recommendedEvents);
appRouter.get("/events/:id", optionalAuth, getEvent);

appRouter.get("/societies", listSocieties);
appRouter.get("/societies/suggested", optionalAuth, suggestedSocieties);
appRouter.get("/societies/:id", getSociety);
appRouter.post("/societies/:id/follow", requireAuth, followSociety);
appRouter.delete("/societies/:id/follow", requireAuth, unfollowSociety);

appRouter.get("/admin/events", requireAdmin, adminListEvents);
appRouter.post("/admin/events", requireAdmin, createEvent);
appRouter.put("/admin/events/:id", requireAdmin, updateEvent);
appRouter.delete("/admin/events/:id", requireAdmin, deleteEvent);

appRouter.get("/push/public-key", publicKey);
appRouter.post("/push/subscribe", requireAuth, subscribe);
appRouter.delete("/push/subscribe", requireAuth, unsubscribe);

export default appRouter;
