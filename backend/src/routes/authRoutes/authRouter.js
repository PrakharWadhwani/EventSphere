import express from "express";
import { googleLogin, devLogin, authConfig, getMe, updateMe } from "../../controllers/Auth.js";
import { requireAuth } from "../../lib/auth.js";

export const AuthRouter = express.Router();

AuthRouter.get("/config", authConfig);
AuthRouter.post("/google", googleLogin);
AuthRouter.post("/dev-login", devLogin);
AuthRouter.get("/me", requireAuth, getMe);
AuthRouter.patch("/me", requireAuth, updateMe);
