import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";

process.env.DB_FILE = path.join(os.tmpdir(), `safebank-test-${Date.now()}.json`);
const { createApp } = await import("../src/app.js");
const { loadDb } = await import("../src/db.js");

loadDb();
const server = createApp().listen(0);
const base = `http://localhost:${server.address().port}/api`;
test.after(() => server.close());

const call = async (method, url, body, token) => {
  const res = await fetch(base + url, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

test("health", async () => {
  const r = await call("GET", "/health");
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "ok");
});

test("auth + budget flow", async () => {
  const s = await call("POST", "/auth/signup", { name: "Test User", email: "t@example.com", password: "password123" });
  assert.equal(s.status, 201);
  const token = s.body.token;
  assert.equal((await call("POST", "/auth/signup", { name: "Test User", email: "t@example.com", password: "password123" })).status, 409);
  assert.equal((await call("POST", "/auth/login", { email: "t@example.com", password: "wrong-pass" })).status, 401);
  assert.equal((await call("GET", "/income")).status, 401);

  const e = await call("POST", "/expenses", { category: "Food", amount: 99.5, date: "2026-10-20" }, token);
  assert.equal(e.status, 201);
  assert.equal((await call("POST", "/expenses", { category: "Nope", amount: 5, date: "2026-10-20" }, token)).status, 400);
  assert.equal((await call("DELETE", `/expenses/${e.body.item.id}`, null, token)).status, 204);
});

test("demo account overview, goals, debt plan", async () => {
  const d = await call("POST", "/auth/demo");
  const t = d.body.token;
  const o = await call("GET", "/overview", null, t);
  assert.equal(o.body.month, "2026-10");
  assert.equal(o.body.totals.income, 8600);
  assert.ok(o.body.insights.length >= 1);
  const g = await call("POST", "/goals/g1/contribute", { amount: 400 }, t);
  assert.equal(g.body.item.saved, 4000);
  const p = await call("GET", "/rebuild/debt-plan?extra=300", null, t);
  assert.ok(p.body.avalanche.months > 0);
  assert.ok(p.body.avalanche.totalInterest <= p.body.snowball.totalInterest + 0.01);
  const lim = await call("PUT", "/budget/limits", { Transport: 700 }, t);
  assert.equal(lim.body.limits.Transport, 700);
});

test("scamshield never says safe and catches obvious scams", async () => {
  const bad = await call("POST", "/scamshield/analyse", { text: "FNB: your account has been suspended. Send your OTP immediately at http://bit.ly/x" });
  assert.equal(bad.body.level, "high");
  assert.ok(bad.body.detected.length >= 3);
  const ok = await call("POST", "/scamshield/analyse", { text: "Hi, lunch tomorrow at 1?" });
  assert.equal(ok.body.level, "low");
  assert.match(ok.body.advice, /does NOT mean/);
});

test("moneywise grading hides answers and saves best score", async () => {
  const t = (await call("POST", "/auth/demo")).body.token;
  const l = await call("GET", "/moneywise/lessons/l1");
  assert.equal(l.body.quiz[0].answer, undefined);
  const r = await call("POST", "/moneywise/lessons/l1/quiz", { answers: [2, 1] }, t);
  assert.equal(r.body.pct, 100);
  const p = await call("GET", "/moneywise/progress", null, t);
  assert.equal(p.body.completed, 1);
});

test("safe-exit is stateless", async () => {
  const r = await call("POST", "/safety/safe-exit", { items: { Transport: 500, Food: 800 } });
  assert.equal(r.body.total, 1300);
});

test("support filters", async () => {
  const r = await call("GET", "/support?category=GBV%20support");
  assert.equal(r.body.items.length, 1);
});

test("scamshield rate limit blocks after 30 requests", async () => {
  const payload = { text: "Are we still on for lunch tomorrow at one?" };
  let lastStatus = 0;
  for (let i = 0; i < 35; i++) {
    const r = await call("POST", "/scamshield/analyse", payload);
    lastStatus = r.status;
    if (lastStatus === 429) break;
  }
  assert.equal(lastStatus, 429);
});


test("auth export returns full user data without sensitive fields", async () => {
  const t = (await call("POST", "/auth/demo")).body.token;
  const r = await call("GET", "/auth/me/export", null, t);
  assert.equal(r.status, 200);
  assert.equal(r.body.user.email, "thando.demo@safebank.co.za");
  assert.equal(r.body.user.passwordHash, undefined);
  assert.ok(Array.isArray(r.body.income));
  assert.ok(Array.isArray(r.body.expenses));
  assert.ok(Array.isArray(r.body.goals));
  assert.equal(typeof r.body.exportedAt, "string");
});
