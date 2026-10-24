import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CalendarDays, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { Badge, Button, Card, CardTitle, EmptyState, Input, Label, Modal, Progress, Select, Switch } from "@/components/ui";
import { EXPENSE_CATEGORIES, INCOME_SOURCES, type Expense, type Income } from "@/lib/demo-data";
import { formatDate, formatZAR, parseAmount, todayISO } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard/smartbudget")({
  head: () => ({
    meta: [
      { title: "SmartBudget — SafeBank" },
      { name: "description", content: "Track income and expenses, set category limits and budget for irregular income. Demo data." },
      { property: "og:title", content: "SmartBudget — SafeBank" },
      { property: "og:description", content: "Interactive budgeting for irregular incomes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SmartBudget,
});

const ESSENTIALS = ["Food", "Transport", "Rent", "Electricity", "Healthcare"];

function useSticky<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
    }
  }, [key, value, ready]);
  return [value, setValue] as const;
}

type IncomeForm = { source: string; amount: string; date: string; note: string };
type ExpenseForm = { category: string; amount: string; date: string; note: string };

function SmartBudget() {
  const store = useSafeBank();
  const hydrated = useHydrated();
  const [irregularMode, setIrregularMode] = useSticky("safebank-irregular", false);
  const [limits, setLimits] = useSticky<Record<string, number>>("safebank-limits", { Transport: 800, Food: 2000 });
  const [plannedSavings, setPlannedSavings] = useSticky("safebank-planned-savings", 600);

  const [incomeModal, setIncomeModal] = useState<{ open: boolean; editing: Income | null }>({ open: false, editing: null });
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; editing: Expense | null }>({ open: false, editing: null });
  const [incomeForm, setIncomeForm] = useState<IncomeForm>({ source: INCOME_SOURCES[0], amount: "", date: todayISO(), note: "" });
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({ category: EXPENSE_CATEGORIES[1], amount: "", date: todayISO(), note: "" });
  const [formError, setFormError] = useState("");

  const totals = useMemo(() => {
    const income = store.income.reduce((a, i) => a + i.amount, 0);
    const expenses = store.expenses.reduce((a, e) => a + e.amount, 0);
    return { income, expenses };
  }, [store.income, store.expenses]);

  const remaining = totals.income - totals.expenses - plannedSavings;

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of store.expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return map;
  }, [store.expenses]);

  const alerts = useMemo(() => {
    const list: { tone: "danger" | "warning"; text: string }[] = [];
    if (totals.expenses > totals.income)
      list.push({ tone: "danger", text: `Your expenses (${formatZAR(totals.expenses)}) exceed your income (${formatZAR(totals.income)}).` });
    for (const [cat, limit] of Object.entries(limits)) {
      const spent = categoryTotals.get(cat) ?? 0;
      if (limit > 0 && spent > limit)
        list.push({ tone: "warning", text: `${cat} has exceeded its budget: ${formatZAR(spent)} spent of a ${formatZAR(limit)} limit.` });
    }
    if (remaining < 0 && plannedSavings > 0)
      list.push({ tone: "warning", text: `Your planned savings of ${formatZAR(plannedSavings)} may leave insufficient funds for essential expenses.` });
    return list;
  }, [totals, limits, categoryTotals, remaining, plannedSavings]);

  // Irregular income helpers
  const monthIncome = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of store.income) {
      const key = i.date.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + i.amount);
    }
    return map;
  }, [store.income]);

  const weeklySummaries = useMemo(() => {
    const byWeek = new Map<number, { total: number; dates: string[] }>();
    for (const i of store.income) {
      const d = new Date(i.date + "T00:00:00");
      const week = Math.floor((d.getDate() - 1) / 7) + 1;
      const cur = byWeek.get(week) ?? { total: 0, dates: [] };
      cur.total += i.amount;
      cur.dates.push(i.date);
      byWeek.set(week, cur);
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([week, v]) => ({
        label: `Week ${week}`,
        days: `${(week - 1) * 7 + 1}–${Math.min(week * 7, 31)}`,
        total: v.total,
      }));
  }, [store.income]);

  const trendData = useMemo(
    () =>
      [...monthIncome.entries()]
        .sort()
        .map(([k, v]) => ({ month: new Date(k + "-01T00:00:00").toLocaleDateString("en-ZA", { month: "short" }), Income: v })),
    [monthIncome],
  );

  const lowestMonth = trendData.length ? Math.min(...trendData.map((t) => t.Income)) : 0;

  const openIncome = (editing?: Income) => {
    setFormError("");
    setIncomeForm(
      editing
        ? { source: editing.source, amount: String(editing.amount), date: editing.date, note: editing.note ?? "" }
        : { source: INCOME_SOURCES[0], amount: "", date: todayISO(), note: "" },
    );
    setIncomeModal({ open: true, editing: editing ?? null });
  };

  const openExpense = (editing?: Expense) => {
    setFormError("");
    setExpenseForm(
      editing
        ? { category: editing.category, amount: String(editing.amount), date: editing.date, note: editing.note ?? "" }
        : { category: EXPENSE_CATEGORIES[1], amount: "", date: todayISO(), note: "" },
    );
    setExpenseModal({ open: true, editing: editing ?? null });
  };

  const saveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(incomeForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    const payload = { source: incomeForm.source, amount, date: incomeForm.date, note: incomeForm.note || undefined };
    if (incomeModal.editing) store.updateIncome(incomeModal.editing.id, payload);
    else store.addIncome(payload);
    setIncomeModal({ open: false, editing: null });
  };

  const saveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(expenseForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    const payload = { category: expenseForm.category, amount, date: expenseForm.date, note: expenseForm.note || undefined };
    if (expenseModal.editing) store.updateExpense(expenseModal.editing.id, payload);
    else store.addExpense(payload);
    setExpenseModal({ open: false, editing: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">SmartBudget</h2>
          <p className="text-sm text-muted-foreground">Budgeting built for irregular incomes. All figures are simulated demo data.</p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2">
          <Switch checked={irregularMode} onCheckedChange={setIrregularMode} label="Irregular income mode" />
          <span className="text-sm font-semibold">Irregular Income Mode</span>
        </div>
      </div>

      {/* Budget alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              role="alert"
              className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm font-medium ${
                a.tone === "danger"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-accent/40 bg-accent/10 text-accent-foreground"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              {a.text}
            </div>
          ))}
        </div>
      )}

      {/* Budget calculator */}
      <Card>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <CardTitle>Budget Calculator</CardTitle>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Total Income", value: totals.income, cls: "text-primary" },
            { label: "Total Expenses", value: totals.expenses, cls: "text-destructive" },
            { label: "Planned Savings", value: plannedSavings, cls: "text-muted-foreground" },
            { label: "Estimated Remaining", value: remaining, cls: remaining >= 0 ? "text-foreground" : "text-destructive" },
          ].map((b) => (
            <div key={b.label} className="rounded-xl bg-muted p-3.5">
              <p className="text-xs font-medium text-muted-foreground">{b.label}</p>
              <p className={`mt-1 text-lg font-extrabold ${b.cls}`}>{formatZAR(b.value)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="w-44">
            <Label htmlFor="planned">Planned savings (ZAR)</Label>
            <Input id="planned" inputMode="decimal" value={String(plannedSavings)} onChange={(e) => setPlannedSavings(parseAmount(e.target.value) || 0)} />
          </div>
          <p className="text-xs text-muted-foreground">Total Income − Total Expenses − Planned Savings = Estimated Remaining Money. Updates instantly.</p>
        </div>
      </Card>

      {/* Income tracker */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Income Tracker</CardTitle>
            <p className="text-sm text-muted-foreground">Total income: <span className="font-bold text-primary">{formatZAR(totals.income)}</span></p>
          </div>
          <Button size="sm" onClick={() => openIncome()}><Plus className="h-4 w-4" /> Add Income</Button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {store.income.length === 0 && (
            <EmptyState icon={<Wallet className="h-8 w-8" />} title="No income yet" body="Add your first income entry to start budgeting." />
          )}
          {[...store.income].sort((a, b) => b.date.localeCompare(a.date)).map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{i.source}{i.note ? ` · ${i.note}` : ""}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(i.date)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-primary">{formatZAR(i.amount)}</span>
                <button onClick={() => openIncome(i)} aria-label={`Edit income ${i.source}`} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => store.removeIncome(i.id)} aria-label={`Delete income ${i.source}`} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Expense tracker */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Expense Tracker</CardTitle>
            <p className="text-sm text-muted-foreground">Total expenses: <span className="font-bold text-destructive">{formatZAR(totals.expenses)}</span></p>
          </div>
          <Button size="sm" variant="outline" onClick={() => openExpense()}><Plus className="h-4 w-4" /> Add Expense</Button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {store.expenses.length === 0 && (
            <EmptyState icon={<Wallet className="h-8 w-8" />} title="No expenses yet" body="Add your first expense to see your budget in action." />
          )}
          {[...store.expenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => {
            const limit = limits[e.category] ?? 0;
            const spent = categoryTotals.get(e.category) ?? 0;
            const over = limit > 0 && spent > limit;
            return (
              <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                    {e.category}
                    {over && <Badge tone="danger">Over budget</Badge>}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDate(e.date)}
                    {e.note ? ` · ${e.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{formatZAR(e.amount)}</span>
                  <button onClick={() => openExpense(e)} aria-label={`Edit ${e.category} expense`} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => store.removeExpense(e.id)} aria-label={`Delete ${e.category} expense`} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Spending limits */}
        <div className="mt-6 rounded-2xl border border-border p-4">
          <p className="text-sm font-bold">Category spending limits</p>
          <p className="text-xs text-muted-foreground">Set a monthly limit per category — SafeBank warns you when a category goes over.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {EXPENSE_CATEGORIES.filter((c) => (categoryTotals.get(c) ?? 0) > 0 || limits[c] !== undefined).map((c) => {
              const spent = categoryTotals.get(c) ?? 0;
              const limit = limits[c] ?? 0;
              return (
                <div key={c}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{c}</span>
                    <span className="text-muted-foreground">{formatZAR(spent)} / {limit > 0 ? formatZAR(limit) : "no limit"}</span>
                  </div>
                  {limit > 0 && <Progress value={(spent / limit) * 100} className="mt-1.5 h-2" />}
                  <Input
                    aria-label={`Monthly limit for ${c}`}
                    inputMode="decimal"
                    placeholder="Set limit"
                    className="mt-1.5 h-8 text-xs"
                    value={limits[c] !== undefined ? String(limits[c]) : ""}
                    onChange={(e) => {
                      const v = e.target.value === "" ? 0 : parseAmount(e.target.value);
                      setLimits({ ...limits, [c]: Number.isFinite(v) ? v : 0 });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Irregular income mode */}
      {irregularMode && (
        <Card>
          <CardTitle>Irregular Income Mode</CardTitle>
          <p className="text-sm text-muted-foreground">Extra tools for inconsistent earnings — built on your lowest month.</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-bold">Weekly summaries</p>
              <div className="mt-2 space-y-2">
                {weeklySummaries.map((w) => (
                  <div key={w.label} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                    <span className="font-semibold">{w.label} <span className="font-normal text-muted-foreground">(days {w.days})</span></span>
                    <span className="font-bold">{formatZAR(w.total)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Daily income entries appear in the Income Tracker above with their exact dates.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-bold">Income trend</p>
              <div className="mt-2 h-40">
                {hydrated && trendData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `R${Number(v) / 1000}k`} width={44} />
                      <Tooltip formatter={(v) => formatZAR(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                      <Bar dataKey="Income" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {lowestMonth > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Your lowest recorded month is <span className="font-bold text-foreground">{formatZAR(lowestMonth)}</span> — a good base for your essential budget.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border p-4">
            <p className="text-sm font-bold">Essential expense prioritisation</p>
            <p className="mt-1 text-xs text-muted-foreground">Cover these first whenever money comes in:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ESSENTIALS.map((e, i) => (
                <span key={e} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {i + 1}. {e}
                </span>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-accent/10 p-3 text-xs text-accent-foreground">
              Flexible suggestion: in a good month, split extra income — 50% to savings, 30% to debt, 20% for yourself. In a slow month, protect essentials first and pause extra savings.
            </p>
          </div>
        </Card>
      )}

      {/* Income modal */}
      <Modal open={incomeModal.open} onClose={() => setIncomeModal({ open: false, editing: null })} title={incomeModal.editing ? "Edit Income" : "Add Income"}>
        <form onSubmit={saveIncome} className="space-y-4">
          <div>
            <Label htmlFor="in-source">Source</Label>
            <Select id="in-source" value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}>
              {INCOME_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="in-amount">Amount (ZAR)</Label>
            <Input id="in-amount" inputMode="decimal" placeholder="e.g. 1500" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="in-date">Date</Label>
            <Input id="in-date" type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="in-note">Note (optional)</Label>
            <Input id="in-note" placeholder="e.g. Weekend market stall" value={incomeForm.note} onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })} />
          </div>
          {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
          <Button type="submit" className="w-full">{incomeModal.editing ? "Save Changes" : "Add Income"}</Button>
        </form>
      </Modal>

      {/* Expense modal */}
      <Modal open={expenseModal.open} onClose={() => setExpenseModal({ open: false, editing: null })} title={expenseModal.editing ? "Edit Expense" : "Add Expense"}>
        <form onSubmit={saveExpense} className="space-y-4">
          <div>
            <Label htmlFor="ex-cat">Category</Label>
            <Select id="ex-cat" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="ex-amount">Amount (ZAR)</Label>
            <Input id="ex-amount" inputMode="decimal" placeholder="e.g. 250" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ex-date">Date</Label>
            <Input id="ex-date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ex-note">Note (optional)</Label>
            <Input id="ex-note" placeholder="e.g. Taxi fare top-ups" value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} />
          </div>
          {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
          <Button type="submit" className="w-full">{expenseModal.editing ? "Save Changes" : "Add Expense"}</Button>
        </form>
      </Modal>
    </div>
  );
}
