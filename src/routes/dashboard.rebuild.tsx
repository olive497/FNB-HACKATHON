import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Briefcase, Plus, Sprout, Trash2, Wallet } from "lucide-react";
import { Badge, Button, Card, CardTitle, EmptyState, Input, Label, Modal, Progress, Select } from "@/components/ui";
import { LESSONS, RECOVERY_RESOURCES, type Debt, type Goal } from "@/lib/demo-data";
import { formatZAR, parseAmount } from "@/lib/format";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard/rebuild")({
  head: () => ({
    meta: [
      { title: "Rebuild — SafeBank" },
      { name: "description", content: "Financial recovery dashboard: debt planning, recovery goals, savings progress and skills resources. Demo data." },
      { property: "og:title", content: "Rebuild — SafeBank" },
      { property: "og:description", content: "Financial recovery and independence planning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rebuild,
});

const GOAL_PRESETS = [
  "Build an emergency fund",
  "Reduce debt",
  "Start a small business",
  "Save for education",
  "Improve financial literacy",
];

function Rebuild() {
  const store = useSafeBank();
  const [debtOpen, setDebtOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({ name: "", balance: "", rate: "", monthly: "" });
  const [goalForm, setGoalForm] = useState({ name: "Build an emergency fund", target: "", saved: "0" });
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const balance = store.debts.reduce((a, d) => a + d.balance, 0);
    const payments = store.debts.reduce((a, d) => a + d.monthlyPayment, 0);
    const saved = store.recoveryGoals.reduce((a, g) => a + g.saved, 0);
    const target = store.recoveryGoals.reduce((a, g) => a + g.target, 0);
    return { balance, payments, saved, target };
  }, [store.debts, store.recoveryGoals]);

  const openDebt = () => {
    setDebtForm({ name: "", balance: "", rate: "", monthly: "" });
    setError("");
    setDebtOpen(true);
  };

  const saveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseAmount(debtForm.balance);
    const rate = parseAmount(debtForm.rate) || 0;
    const monthly = parseAmount(debtForm.monthly);
    if (!debtForm.name.trim()) {
      setError("Give the debt a name.");
      return;
    }
    if (!Number.isFinite(balance) || balance <= 0) {
      setError("Enter an outstanding balance greater than zero.");
      return;
    }
    if (!Number.isFinite(monthly) || monthly <= 0) {
      setError("Enter a monthly repayment greater than zero.");
      return;
    }
    store.addDebt({ name: debtForm.name.trim(), balance, rate, monthlyPayment: monthly });
    setDebtOpen(false);
  };

  const saveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseAmount(goalForm.target);
    const saved = parseAmount(goalForm.saved) || 0;
    if (!Number.isFinite(target) || target <= 0) {
      setError("Enter a target amount greater than zero.");
      return;
    }
    store.addRecoveryGoal({ name: goalForm.name.trim() || "Recovery goal", category: "Personal Savings", target, saved });
    setGoalOpen(false);
  };

  const recommended = LESSONS.filter((l) => ["Understanding Credit", "Saving Money", "Budgeting Basics"].includes(l.category));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight"><Sprout className="h-5 w-5 text-primary" /> Rebuild</h2>
        <p className="text-sm text-muted-foreground">Recover, plan and grow towards independence. Simulated demo data.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total debt balance</p>
          <p className="text-2xl font-extrabold">{formatZAR(totals.balance)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across {store.debts.length} planned debts</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Monthly repayments</p>
          <p className="text-2xl font-extrabold">{formatZAR(totals.payments)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Planned each month</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Recovery savings</p>
          <p className="text-2xl font-extrabold text-primary">{formatZAR(totals.saved)}</p>
          <p className="mt-1 text-xs text-muted-foreground">of {formatZAR(totals.target)} targeted</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Debt planner */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle>Debt Planner</CardTitle>
            </div>
            <Button size="sm" onClick={openDebt}><Plus className="h-4 w-4" /> Add Debt</Button>
          </div>
          <div className="mt-4 space-y-3">
            {store.debts.length === 0 && (
              <EmptyState icon={<Wallet className="h-8 w-8" />} title="No debts planned" body="Add a debt to see an illustrative repayment plan." />
            )}
            {store.debts.map((d: Debt) => {
              const months = Math.ceil(d.balance / d.monthlyPayment);
              const approxInterest = Math.max(0, Math.round(d.balance * (d.rate / 100) * (months / 24)));
              return (
                <div key={d.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.rate}% per year · {formatZAR(d.monthlyPayment)}/month</p>
                    </div>
                    <button onClick={() => store.removeDebt(d.id)} aria-label={`Remove debt ${d.name}`} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Progress value={Math.min(100, (d.monthlyPayment * 12 / (d.balance + approxInterest)) * 100 / 12 * 12)} className="mt-3" />
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Outstanding: <span className="font-bold text-foreground">{formatZAR(d.balance)}</span></span>
                    <span>≈ {months} months to clear at this payment</span>
                    <span>≈ {formatZAR(approxInterest)} interest over that period</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            Illustrative summary only — real interest, fees and settlement quotes come from your credit provider. Getting a free debt-counselling assessment is often a good first step.
          </p>
        </Card>

        {/* Recovery goals */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              <CardTitle>Financial Recovery Goals</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setGoalOpen(true); setError(""); }}>
              <Plus className="h-4 w-4" /> Add Goal
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {store.recoveryGoals.length === 0 && (
              <EmptyState icon={<Sprout className="h-8 w-8" />} title="No recovery goals yet" body="Create a goal to start rebuilding." />
            )}
            {store.recoveryGoals.map((g: Goal) => {
              const pct = Math.round((g.saved / g.target) * 100);
              return (
                <div key={g.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold">{g.name}</p>
                    <button onClick={() => store.removeRecoveryGoal(g.id)} aria-label={`Remove goal ${g.name}`} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Progress value={pct} className="mt-2.5" />
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">{formatZAR(g.saved)} of {formatZAR(g.target)}</span>
                    <Badge tone={pct >= 100 ? "positive" : "brand"}>{pct}%</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Monthly budget reset: revisit SmartBudget each month and rebuild your plan from your latest income — a fresh start, every month.</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Education recommendations */}
        <Card>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Recommended Lessons</CardTitle>
          </div>
          <div className="mt-3 space-y-2">
            {recommended.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 rounded-xl bg-muted p-3 text-sm">
                <div>
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.category} · {l.minutes} min</p>
                </div>
                <Badge tone="brand">MoneyWise</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Resources */}
        <Card>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle>Employment & Skills Resources</CardTitle>
          </div>
          <div className="mt-3 space-y-2">
            {RECOVERY_RESOURCES.map((r) => (
              <div key={r.title} className="rounded-xl bg-muted p-3 text-sm">
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Debt modal */}
      <Modal open={debtOpen} onClose={() => setDebtOpen(false)} title="Add Debt to Plan">
        <form onSubmit={saveDebt} className="space-y-4">
          <div>
            <Label htmlFor="d-name">Debt name</Label>
            <Input id="d-name" placeholder="e.g. Store account" value={debtForm.name} onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="d-balance">Outstanding balance (ZAR)</Label>
              <Input id="d-balance" inputMode="decimal" placeholder="e.g. 4200" value={debtForm.balance} onChange={(e) => setDebtForm({ ...debtForm, balance: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d-rate">Interest rate (% / year)</Label>
              <Input id="d-rate" inputMode="decimal" placeholder="e.g. 21" value={debtForm.rate} onChange={(e) => setDebtForm({ ...debtForm, rate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="d-monthly">Monthly repayment (ZAR)</Label>
            <Input id="d-monthly" inputMode="decimal" placeholder="e.g. 690" value={debtForm.monthly} onChange={(e) => setDebtForm({ ...debtForm, monthly: e.target.value })} />
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Add to Plan</Button>
        </form>
      </Modal>

      {/* Recovery goal modal */}
      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Add Recovery Goal">
        <form onSubmit={saveGoal} className="space-y-4">
          <div>
            <Label htmlFor="rg-name">Goal</Label>
            <Select id="rg-name" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}>
              {GOAL_PRESETS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rg-target">Target (ZAR)</Label>
              <Input id="rg-target" inputMode="decimal" placeholder="e.g. 5000" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="rg-saved">Saved so far (ZAR)</Label>
              <Input id="rg-saved" inputMode="decimal" value={goalForm.saved} onChange={(e) => setGoalForm({ ...goalForm, saved: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Create Goal</Button>
        </form>
      </Modal>
    </div>
  );
}
