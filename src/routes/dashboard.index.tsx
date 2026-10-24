import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  MessageSquareWarning,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Label, Modal, Progress, Select, SectionTitle } from "@/components/ui";
import { EXPENSE_CATEGORIES, INCOME_SOURCES, INSIGHT_COPY } from "@/lib/demo-data";
import { formatZAR, formatZARShort, parseAmount, todayISO } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — SafeBank" },
      { name: "description", content: "Financial overview: income, expenses, balance, savings progress, quick actions and smart insights. Demo data." },
      { property: "og:title", content: "Overview — SafeBank" },
      { property: "og:description", content: "Your SafeBank financial overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sumBy<T>(items: T[], pick: (t: T) => number) {
  return items.reduce((acc, x) => acc + pick(x), 0);
}

function pctChange(cur: number, prev: number) {
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

function Overview() {
  const store = useSafeBank();
  const hydrated = useHydrated();
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevDate.toISOString().slice(0, 7);

  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [form, setForm] = useState<{ source: string; category: string; amount: string; date: string }>({
    source: INCOME_SOURCES[0] ?? "Salary",
    category: EXPENSE_CATEGORIES[1] ?? "Food",
    amount: "",
    date: todayISO(),
  });
  const [formError, setFormError] = useState("");

  const incomeThis = useMemo(() => sumBy(store.income.filter((i) => i.date.startsWith(thisMonth)), (i) => i.amount), [store.income, thisMonth]);
  const incomePrev = useMemo(() => sumBy(store.income.filter((i) => i.date.startsWith(prevMonth)), (i) => i.amount), [store.income, prevMonth]);
  const expensesThis = useMemo(() => sumBy(store.expenses.filter((e) => e.date.startsWith(thisMonth)), (e) => e.amount), [store.expenses, thisMonth]);
  const expensesPrev = useMemo(() => sumBy(store.expenses.filter((e) => e.date.startsWith(prevMonth)), (e) => e.amount), [store.expenses, prevMonth]);

  const balance = incomeThis - expensesThis;
  const savedTotal = sumBy(store.goals, (g) => g.saved);
  const targetTotal = sumBy(store.goals, (g) => g.target);
  const savingsPct = targetTotal > 0 ? Math.round((savedTotal / targetTotal) * 100) : 0;

  const monthlyData = useMemo(() => {
    const keys = [2, 1, 0].map((back) => {
      const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
      return d.toISOString().slice(0, 7);
    });
    return keys.map((k) => ({
      month: MONTHS[Number(k.slice(5, 7)) - 1],
      Income: sumBy(store.income.filter((i) => i.date.startsWith(k)), (i) => i.amount),
      Expenses: sumBy(store.expenses.filter((e) => e.date.startsWith(k)), (e) => e.amount),
    }));
  }, [store.income, store.expenses]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of store.expenses.filter((x) => x.date.startsWith(thisMonth))) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [store.expenses, thisMonth]);

  const goalData = store.goals.map((g) => ({ name: g.name, Saved: g.saved, Target: g.target }));

  // Smart insights (simple, explainable calculations)
  const transportThis = sumBy(store.expenses.filter((e) => e.category === "Transport" && e.date.startsWith(thisMonth)), (e) => e.amount);
  const transportPrev = sumBy(store.expenses.filter((e) => e.category === "Transport" && e.date.startsWith(prevMonth)), (e) => e.amount);
  const transportPct = pctChange(transportThis, transportPrev);
  const emergencyGoal = store.goals.find((g) => g.category === "Emergency Fund");
  const emergencyPct = emergencyGoal ? Math.round((emergencyGoal.saved / emergencyGoal.target) * 100) : 0;

  const insights = [
    transportPct !== null && transportPct > 0 ? INSIGHT_COPY.transportUp(transportPct) : null,
    emergencyGoal ? INSIGHT_COPY.savingsGoal(emergencyPct) : null,
    INSIGHT_COPY.foodReview,
  ].filter(Boolean) as string[];

  const submitIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    store.addIncome({ source: form.source, amount, date: form.date });
    setForm({ ...form, amount: "" });
    setFormError("");
    setIncomeOpen(false);
  };

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    store.addExpense({ category: form.category, amount, date: form.date });
    setForm({ ...form, amount: "" });
    setFormError("");
    setExpenseOpen(false);
  };

  const stats = [
    {
      label: "Total Income",
      value: incomeThis,
      sub: "this month",
      change: pctChange(incomeThis, incomePrev),
      good: true,
      icon: TrendingUp,
    },
    {
      label: "Total Expenses",
      value: expensesThis,
      sub: "this month",
      change: pctChange(expensesThis, incomePrev > 0 ? expensesPrev : 0),
      good: false,
      icon: Wallet,
    },
    {
      label: "Available Balance",
      value: balance,
      sub: "income − expenses",
      change: null,
      good: balance >= 0,
      icon: ArrowUpRight,
    },
    {
      label: "Savings Progress",
      value: savingsPct,
      isPct: true,
      sub: `${formatZAR(savedTotal)} of ${formatZAR(targetTotal)}`,
      change: null,
      good: true,
      icon: PiggyBank,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle title="Financial Overview" subtitle="All figures are simulated demo data (ZAR)." />
        <Badge tone="brand" className="hidden shrink-0 sm:inline-flex">Demo data</Badge>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <s.icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">
              {s.isPct ? `${s.value}%` : formatZAR(s.value)}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              {s.change !== null && (
                <span className={`inline-flex items-center gap-0.5 font-semibold ${s.change >= 0 === s.good ? "text-primary" : "text-destructive"}`}>
                  {s.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(s.change)}%
                </span>
              )}
              <span className="text-muted-foreground">{s.sub}</span>
            </div>
            {s.isPct && <Progress value={savingsPct} className="mt-2.5" />}
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Income vs Expenses</CardTitle>
          <p className="text-xs text-muted-foreground">Last three months, simulated demo data.</p>
          <div className="mt-4 h-64">
            {hydrated && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `R${Number(v) / 1000}k`} width={44} />
                  <Tooltip formatter={(v) => formatZAR(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Income" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expenses" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card>
          <CardTitle>Expense Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">This month by category.</p>
          <div className="mt-4 h-64">
            {hydrated && categoryData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatZAR(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <Card className="lg:col-span-2">
          <CardTitle>Quick Actions</CardTitle>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <Button onClick={() => setIncomeOpen(true)}><Plus className="h-4 w-4" /> Add Income</Button>
            <Button variant="outline" onClick={() => setExpenseOpen(true)}><Plus className="h-4 w-4" /> Add Expense</Button>
            <Link to="/dashboard/safepocket">
              <Button variant="outline" className="w-full"><PiggyBank className="h-4 w-4" /> Create Savings Goal</Button>
            </Link>
            <Link to="/dashboard/scamshield">
              <Button variant="outline" className="w-full"><MessageSquareWarning className="h-4 w-4" /> Check a Suspicious Message</Button>
            </Link>
            <Link to="/dashboard/smartbudget" className="sm:col-span-2">
              <Button variant="gold" className="w-full"><Wallet className="h-4 w-4" /> Open Budget Planner</Button>
            </Link>
          </div>
        </Card>

        {/* Smart insights */}
        <Card>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-4.5 w-4.5 text-accent" /> Smart Insights</CardTitle>
          <ul className="mt-3 space-y-2.5">
            {insights.map((ins, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-muted p-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {ins}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">{INSIGHT_COPY.disclaimer}</p>
        </Card>
      </div>

      {/* Savings progress chart */}
      <Card>
        <CardTitle>Savings Goals Progress</CardTitle>
        <p className="text-xs text-muted-foreground">Saved amount against each goal's target.</p>
        <div className="mt-4 h-56">
          {hydrated && goalData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatZARShort(Number(v))} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={11} width={130} />
                <Tooltip formatter={(v) => formatZAR(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Bar dataKey="Saved" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <Link to="/dashboard/safepocket" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
          Manage goals in SafePocket →
        </Link>
      </Card>

      {/* Add income modal */}
      <Modal open={incomeOpen} onClose={() => setIncomeOpen(false)} title="Add Income">
        <form onSubmit={submitIncome} className="space-y-4">
          <div>
            <Label htmlFor="qi-source">Source</Label>
            <Select id="qi-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {INCOME_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="qi-amount">Amount (ZAR)</Label>
            <Input id="qi-amount" inputMode="decimal" placeholder="e.g. 1500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="qi-date">Date</Label>
            <Input id="qi-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
          <Button type="submit" className="w-full">Add Income</Button>
        </form>
      </Modal>

      {/* Add expense modal */}
      <Modal open={expenseOpen} onClose={() => setExpenseOpen(false)} title="Add Expense">
        <form onSubmit={submitExpense} className="space-y-4">
          <div>
            <Label htmlFor="qe-cat">Category</Label>
            <Select id="qe-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="qe-amount">Amount (ZAR)</Label>
            <Input id="qe-amount" inputMode="decimal" placeholder="e.g. 250" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="qe-date">Date</Label>
            <Input id="qe-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
          <Button type="submit" className="w-full">Add Expense</Button>
        </form>
      </Modal>
    </div>
  );
}
