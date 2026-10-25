import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { seed } from "../data/index.js";
import { findUserByEmail, save } from "../db.js";
import { HttpError, requireAuth, signToken, validate } from "../middleware/index.js";
import { createUser, defaultPrefs, demoData, publicUser } from "../services/users.js";

export const auth = Router();

// Very small in-memory rate limiter for credential endpoints.
const hits = new Map();
function limit(max = 20, windowMs = 60_000) {
  return (req, _res, next) => {
    const now = Date.now();
    const key = req.ip + req.path;
    const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    arr.push(now);
    hits.set(key, arr);
    if (arr.length > max) return next(new HttpError(429, "Too many attempts, try again in a minute"));
    next();
  };
}

const prefsSchema = z.object({
  language: z.enum(["en", "zu"]),
  largeText: z.boolean(),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  simpleLanguage: z.boolean(),
}).partial();

auth.post(
  "/signup",
  limit(),
  validate(z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(8).max(100) })),
  async (req, res) => {
    if (findUserByEmail(req.body.email)) throw new HttpError(409, "An account with this email already exists");
    const user = await createUser(req.body);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  },
);

auth.post("/login", limit(), validate(z.object({ email: z.string().email(), password: z.string().min(1) })), async (req, res) => {
  const user = findUserByEmail(req.body.email);
  const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!ok) throw new HttpError(401, "Incorrect email or password");
  res.json({ token: signToken(user), user: publicUser(user) });
});

// One-tap judge/demo account with the sample budget (Thando Mokoena).
auth.post("/demo", limit(), async (_req, res) => {
  let user = findUserByEmail(seed.demoUser.email);
  if (!user) {
    user = await createUser({ name: seed.demoUser.name, email: seed.demoUser.email, password: crypto.randomBytes(24).toString("hex") });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

auth.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

auth.patch(
  "/me",
  requireAuth,
  validate(z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), theme: z.enum(["light", "dark"]), irregularMode: z.boolean() }).partial()),
  (req, res) => {
    if (req.body.email && req.body.email.toLowerCase() !== req.user.email) {
      if (findUserByEmail(req.body.email)) throw new HttpError(409, "Email already in use");
      req.body.email = req.body.email.toLowerCase();
    }
    Object.assign(req.user, req.body);
    save();
    res.json({ user: publicUser(req.user) });
  },
);

auth.post(
  "/onboarding",
  requireAuth,
  validate(z.object({ incomeType: z.string().max(60), goals: z.array(z.string().max(60)).max(10).default([]), prefs: prefsSchema.default({}) })),
  (req, res) => {
    Object.assign(req.user, {
      onboarded: true,
      incomeType: req.body.incomeType,
      goalsSelected: req.body.goals,
      prefs: { ...req.user.prefs, ...req.body.prefs },
    });
    save();
    res.json({ user: publicUser(req.user) });
  },
);

auth.put("/prefs", requireAuth, validate(prefsSchema), (req, res) => {
  req.user.prefs = { ...defaultPrefs(), ...req.user.prefs, ...req.body };
  save();
  res.json({ prefs: req.user.prefs });
});

auth.post("/change-password", requireAuth, limit(5), validate(z.object({ currentPassword: z.string(), newPassword: z.string().min(8).max(100) })), async (req, res) => {
  if (!(await bcrypt.compare(req.body.currentPassword, req.user.passwordHash))) throw new HttpError(401, "Current password is incorrect");
  req.user.passwordHash = await bcrypt.hash(req.body.newPassword, 10);
  save();
  res.json({ ok: true });
});

// Forgot password: demo only. Always answers the same so it cannot be used to discover accounts.
auth.post("/forgot-password", limit(5), validate(z.object({ email: z.string().email() })), (_req, res) => {
  res.json({ ok: true, message: "If an account exists for that email, reset instructions would be sent (demo - no email is sent)." });
});

auth.post("/reset-demo-data", requireAuth, (req, res) => {
  Object.assign(req.user, demoData());
  save();
  res.json({ ok: true, message: "Demo data reset to the original sample budget." });
});

auth.delete("/me", requireAuth, (req, res) => {
  req.user.income = req.user.expenses = req.user.goals = req.user.debts = req.user.recoveryGoals = [];
  req.user.email = `deleted-${req.user.id}@deleted.local`;
  req.user.name = "Deleted";
  req.user.passwordHash = "!";
  save();
  res.json({ ok: true });
});
