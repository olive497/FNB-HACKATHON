import { Router } from "express";
import { z } from "zod";
import { seed } from "../data/index.js";
import { save, uid } from "../db.js";
import { HttpError, requireAuth, validate } from "../middleware/index.js";
import { categoryTotals, debtPlan, irregularIncome, monthKey, monthlyTotals, savingsPlan } from "../services/calc.js";

export const finance = Router();
finance.use(requireAuth);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-mm-dd");
const money = z.number().finite().positive().max(10_000_000);
const note = z.string().max(200).optional();

/** Builds list/create/get/update/delete endpoints for one per-user collection. */
function crud(path, key, createSchema, { sortBy, filters = [] } = {}) {
  const r = Router();
  r.get("/", (req, res) => {
    let items = [...req.user[key]];
    for (const f of filters) if (req.query[f]) items = items.filter((i) => i[f] === req.query[f]);
    if (req.query.month) items = items.filter((i) => i.date && monthKey(i.date) === req.query.month);
    if (sortBy) items.sort((a, b) => String(b[sortBy]).localeCompare(String(a[sortBy])));
    res.json({ items });
  });
  r.post("/", validate(createSchema), (req, res) => {
    const item = { id: uid(), ...req.body };
    req.user[key].push(item);
    save();
    res.status(201).json({ item });
  });
  r.get("/:id", (req, res) => {
    const item = req.user[key].find((i) => i.id === req.params.id);
    if (!item) throw new HttpError(404, "Not found");
    res.json({ item });
  });
  r.patch("/:id", validate(createSchema.partial()), (req, res) => {
    const item = req.user[key].find((i) => i.id === req.params.id);
    if (!item) throw new HttpError(404, "Not found");
    Object.assign(item, req.body);
    save();
    res.json({ item });
  });
  r.delete("/:id", (req, res) => {
    const before = req.user[key].length;
    req.user[key] = req.user[key].filter((i) => i.id !== req.params.id);
    if (req.user[key].length === before) throw new HttpError(404, "Not found");
    save();
    res.status(204).end();
  });
  finance.use(path, r);
  return r;
}

const incomeSchema = z.object({ source: z.enum(seed.categories.income), amount: money, date: isoDate, note });
const expenseSchema = z.object({ category: z.enum(seed.categories.expense), amount: money, date: isoDate, note });
const goalSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(seed.categories.goal),
  target: money,
  saved: z.number().min(0).max(10_000_000).default(0),
  targetDate: isoDate.optional(),
});
const debtSchema = z.object({
  name: z.string().trim().min(1).max(80),
  balance: money,
  rate: z.number().min(0).max(100),
  monthlyPayment: money,
});

crud("/income", "income", incomeSchema, { sortBy: "date", filters: ["source"] });
crud("/expenses", "expenses", expenseSchema, { sortBy: "date", filters: ["category"] });
const goals = crud("/goals", "goals", goalSchema);
crud("/debts", "debts", debtSchema);
const recovery = crud("/recovery-goals", "recoveryGoals", goalSchema);

// Add money to a goal (SafePocket / Rebuild goals). The app only TRACKS the goal - it never moves real money.
const contribute = (key) => (req, res) => {
  const goal = req.user[key].find((g) => g.id === req.params.id);
  if (!goal) throw new HttpError(404, "Not found");
  goal.saved = Math.round((goal.saved + req.body.amount) * 100) / 100;
  save();
  res.json({ item: goal, completed: goal.saved >= goal.target });
};
goals.post("/:id/contribute", validate(z.object({ amount: money })), contribute("goals"));
recovery.post("/:id/contribute", validate(z.object({ amount: money })), contribute("recoveryGoals"));

/* ---------------- SmartBudget ---------------- */

finance.get("/budget/summary", (req, res) => {
  const { income, expenses, budgetLimits } = req.user;
  const trend = monthlyTotals(income, expenses);
  const month = req.query.month ?? trend.at(-1)?.month;
  const current = trend.find((t) => t.month === month) ?? { month, income: 0, expenses: 0, balance: 0 };
  const spent = categoryTotals(expenses, month);
  const categories = Object.entries({ ...Object.fromEntries(Object.keys(budgetLimits).map((c) => [c, 0])), ...spent }).map(([category, amount]) => {
    const limit = budgetLimits[category] ?? 0;
    return { category, spent: amount, limit, over: limit > 0 && amount > limit };
  });
  const alerts = [];
  for (const c of categories) {
    if (c.over) alerts.push({ tone: "warning", text: `${c.category} has exceeded its budget: R${c.spent} spent of a R${c.limit} limit.` });
  }
  if (current.balance < 0) alerts.push({ tone: "danger", text: "You have spent more than you earned this month." });
  res.json({ month, current, trend, categories, alerts, irregularMode: req.user.irregularMode });
});

finance.get("/budget/limits", (req, res) => res.json({ limits: req.user.budgetLimits }));
finance.put(
  "/budget/limits",
  validate(z.record(z.enum(seed.categories.expense), z.number().min(0).max(10_000_000))),
  (req, res) => {
    req.user.budgetLimits = req.body;
    save();
    res.json({ limits: req.user.budgetLimits });
  },
);
finance.get("/budget/irregular", (req, res) => res.json(irregularIncome(req.user.income)));

/* ---------------- Calculators (stateless) ---------------- */

finance.post(
  "/calculators/savings",
  validate(z.object({ target: money, saved: z.number().min(0).default(0), months: z.number().int().min(1).max(600).optional(), monthly: money.optional() }).refine((v) => v.months || v.monthly, "Provide months or monthly")),
  (req, res) => res.json(savingsPlan(req.body)),
);

finance.get("/rebuild/debt-plan", (req, res) => {
  const extra = Math.max(0, Number(req.query.extra ?? 0) || 0);
  res.json(debtPlan(req.user.debts, extra));
});

finance.get("/rebuild/summary", (req, res) => {
  const sum = (a, k) => a.reduce((t, x) => t + x[k], 0);
  res.json({
    totalDebt: sum(req.user.debts, "balance"),
    monthlyDebtPayments: sum(req.user.debts, "monthlyPayment"),
    recoverySaved: sum(req.user.recoveryGoals, "saved"),
    recoveryTarget: sum(req.user.recoveryGoals, "target"),
  });
});

/* ---------------- Overview ---------------- */

finance.get("/overview", (req, res) => {
  const { income, expenses, goals: g } = req.user;
  const trend = monthlyTotals(income, expenses);
  const month = req.query.month ?? trend.at(-1)?.month;
  const idx = trend.findIndex((t) => t.month === month);
  const current = trend[idx] ?? { month, income: 0, expenses: 0, balance: 0 };
  const spent = categoryTotals(expenses, month);
  const prevSpent = idx > 0 ? categoryTotals(expenses, trend[idx - 1].month) : {};
  const insights = [];
  if ((prevSpent.Transport ?? 0) > 0 && (spent.Transport ?? 0) > prevSpent.Transport) {
    const pct = Math.round(((spent.Transport - prevSpent.Transport) / prevSpent.Transport) * 100);
    insights.push(`You've spent ${pct}% more on transport this month than last month.`);
  }
  const emergency = g.find((x) => x.category === "Emergency Fund");
  if (emergency) insights.push(`Your emergency savings goal is ${Math.round((emergency.saved / emergency.target) * 100)}% complete.`);
  if (current.income > 0 && (spent.Food ?? 0) / current.income > 0.2) insights.push("Consider reviewing your food budget before adding extra savings.");
  res.json({
    month,
    totals: current,
    categoryBreakdown: Object.entries(spent).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
    trend,
    goals: g.map((x) => ({ id: x.id, name: x.name, saved: x.saved, target: x.target, progressPct: Math.min(100, Math.round((x.saved / x.target) * 100)) })),
    recentTransactions: [
      ...income.map((i) => ({ ...i, type: "income" })),
      ...expenses.map((e) => ({ ...e, type: "expense" })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    insights,
    insightsDisclaimer: "Insights are simple calculations based on your demo data - not predictions from an AI model.",
  });
});

finance.get("/meta/categories", (_req, res) => res.json(seed.categories));
