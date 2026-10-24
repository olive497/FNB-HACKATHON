import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { findUserById, save } from "../db.js";
import { HttpError, validate } from "../middleware/index.js";
import { lessonData, scamEducation, supportData, seed } from "../data/index.js";
import { analyseMessage, loadModel } from "../services/scam.js";

export const learn = Router();

// Public endpoints work without login; if a valid token is sent, progress is saved.
learn.use((req, _res, next) => {
  const h = req.headers.authorization ?? "";
  if (h.startsWith("Bearer ")) {
    try {
      req.user = findUserById(jwt.verify(h.slice(7), config.jwtSecret).sub);
    } catch { /* anonymous */ }
  }
  next();
});

/* ---------------- ScamShield ---------------- */

learn.post("/scamshield/analyse", validate(z.object({ text: z.string().trim().min(3).max(5000) })), (req, res) => {
  res.json(analyseMessage(req.body.text));
});
learn.get("/scamshield/education", (_req, res) => res.json({ items: scamEducation.education }));
learn.get("/scamshield/model", (_req, res) => {
  const m = loadModel();
  res.json(m ? { available: true, ...m.meta } : { available: false, hint: "Run `npm run train` in the backend folder." });
});

const strip = (q) => ({ q: q.q, options: q.options });
learn.get("/scamshield/quiz", (_req, res) => res.json({ questions: scamEducation.quiz.map(strip) }));
learn.post("/scamshield/quiz/submit", validate(z.object({ answers: z.array(z.number().int()) })), (req, res) => {
  const results = scamEducation.quiz.map((q, i) => ({ correct: req.body.answers[i] === q.answer, answer: q.answer, explain: q.explain }));
  const score = results.filter((r) => r.correct).length;
  const pct = Math.round((score / results.length) * 100);
  if (req.user) {
    req.user.scamQuizBest = Math.max(req.user.scamQuizBest ?? 0, pct);
    save();
  }
  res.json({ score, total: results.length, pct, results });
});

/* ---------------- MoneyWise ---------------- */

learn.get("/moneywise/lessons", (req, res) => {
  const best = req.user?.lessonBest ?? {};
  res.json({
    categories: lessonData.categories,
    lessons: lessonData.lessons.map((l) => ({ id: l.id, title: l.title, category: l.category, minutes: l.minutes, questions: l.quiz.length, best: best[l.id] ?? null })),
  });
});
learn.get("/moneywise/lessons/:id", (req, res) => {
  const l = lessonData.lessons.find((x) => x.id === req.params.id);
  if (!l) throw new HttpError(404, "Lesson not found");
  res.json({ ...l, quiz: l.quiz.map(strip), best: req.user?.lessonBest?.[l.id] ?? null });
});
learn.post("/moneywise/lessons/:id/quiz", validate(z.object({ answers: z.array(z.number().int()) })), (req, res) => {
  const l = lessonData.lessons.find((x) => x.id === req.params.id);
  if (!l) throw new HttpError(404, "Lesson not found");
  const results = l.quiz.map((q, i) => ({ correct: req.body.answers[i] === q.answer, answer: q.answer, explain: q.explain }));
  const score = results.filter((r) => r.correct).length;
  const pct = Math.round((score / l.quiz.length) * 100);
  let best = pct;
  if (req.user) {
    best = Math.max(req.user.lessonBest[l.id] ?? 0, pct);
    req.user.lessonBest[l.id] = best;
    save();
  }
  res.json({ score, total: l.quiz.length, pct, best, saved: Boolean(req.user), results });
});
learn.get("/moneywise/progress", (req, res) => {
  const best = req.user?.lessonBest ?? {};
  const total = lessonData.lessons.length;
  const done = lessonData.lessons.filter((l) => best[l.id] !== undefined);
  const avg = done.length ? Math.round(done.reduce((a, l) => a + best[l.id], 0) / done.length) : 0;
  res.json({
    completed: done.length,
    total,
    overallPct: Math.round((done.length / total) * 100),
    averageScore: avg,
    best,
    badges: [
      { label: "First Steps", earned: done.length >= 1, desc: "Complete your first lesson" },
      { label: "Scam Spotter", earned: (best.l4 ?? 0) > 0, desc: "Complete Understanding Financial Abuse" },
      { label: "Money Master", earned: done.length === total, desc: "Complete every lesson" },
    ],
  });
});

/* ---------------- Financial Safety (stateless on purpose) ---------------- */
// Nothing sent to these endpoints is stored or logged: the frontend keeps SafeExit entries and the
// Safety Circle in memory only, and the server mirrors that privacy rule.

learn.post(
  "/safety/safe-exit",
  validate(z.object({ items: z.record(z.enum(seed.categories.safety), z.number().min(0).max(1_000_000)), weeks: z.number().int().min(1).max(52).default(4) })),
  (req, res) => {
    const monthlyItems = Object.entries(req.body.items);
    const total = monthlyItems.reduce((a, [, v]) => a + v, 0);
    res.set("Cache-Control", "no-store");
    res.json({ total, items: req.body.items, weeks: req.body.weeks, estimatedForWeeks: Math.round(total * (req.body.weeks / 4) * 100) / 100, note: "Estimate only. Nothing you enter here is saved." });
  },
);
learn.get("/safety/items", (_req, res) => res.json({ items: seed.categories.safety }));

/* ---------------- Support Navigator ---------------- */

learn.get("/support", (req, res) => {
  const { category, region, q } = req.query;
  let items = supportData.entries;
  if (category) items = items.filter((e) => e.category === category);
  if (region) items = items.filter((e) => e.region.toLowerCase().includes(String(region).toLowerCase()) || e.region === "National");
  if (q) items = items.filter((e) => `${e.name} ${e.category} ${e.region}`.toLowerCase().includes(String(q).toLowerCase()));
  res.json({ categories: supportData.categories, items, notice: "Sample listings - not verified. Always confirm details with the organisation." });
});
learn.get("/rebuild/resources", (_req, res) => res.json({ items: supportData.recoveryResources }));
