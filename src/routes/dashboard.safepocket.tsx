import { createFileRoute } from "@tanstack/react-router";

import { useMemo, useState } from "react";

import { PiggyBank, Pencil, Plus, Target, Trash2, TrendingUp } from "lucide-react";

import {

  Badge,

  Button,

  Card,

  CardTitle,

  EmptyState,

  Input,

  Label,

  Modal,

  Progress,

  Select,

} from "@/components/ui";

import { GOAL_CATEGORIES, type Goal } from "@/lib/demo-data";

import { formatZAR, formatDate, parseAmount } from "@/lib/format";

import { useSafeBank } from "@/store/store";



export const Route = createFileRoute("/dashboard/safepocket")({

  head: () => ({

    meta: [

      { title: "SafePocket — SafeBank" },

      {

        name: "description",

        content:

          "Flexible savings goal tracker with contributions, progress bars and a savings calculator. Demo data.",

      },

      { property: "og:title", content: "SafePocket — SafeBank" },

      { property: "og:description", content: "Plan and track flexible savings goals." },

      { property: "og:type", content: "website" },

      { name: "twitter:card", content: "summary_large_image" },

    ],

  }),

  component: SafePocket,

});



type GoalForm = {

  name: string;

  category: string;

  target: string;

  saved: string;

  targetDate: string;

};



function SafePocket() {

  const store = useSafeBank();

  const [modal, setModal] = useState<{ open: boolean; editing: Goal | null }>({

    open: false,

    editing: null,

  });

  const [contribModal, setContribModal] = useState<{ open: boolean; goal: Goal | null }>({

    open: false,

    goal: null,

  });

  const [form, setForm] = useState<GoalForm>({

    name: "",

    category: GOAL_CATEGORIES[0],

    target: "",

    saved: "0",

    targetDate: "",

  });

  const [contribAmount, setContribAmount] = useState("");

  const [error, setError] = useState("");

  const [calc, setCalc] = useState({ target: "6000", months: "6" });



  const totals = useMemo(() => {

    const saved = store.goals.reduce((a, g) => a + g.saved, 0);

    const target = store.goals.reduce((a, g) => a + g.target, 0);

    return { saved, target, pct: target > 0 ? Math.min(100, Math.max(0, Math.round((saved / target) * 100))) : 0 };

  }, [store.goals]);



  // Calculate available money before suggesting savings

const monthlyFinances = useMemo(() => {

  const now = new Date();



  const monthKey = `${now.getFullYear()}-${String(

    now.getMonth() + 1

  ).padStart(2, "0")}`;



  const income = store.income

    .filter((item) => item.date.startsWith(monthKey))

    .reduce((total, item) => total + item.amount, 0);



  const expenses = store.expenses

    .filter((item) => item.date.startsWith(monthKey))

    .reduce((total, item) => total + item.amount, 0);



  return {

    income,

    expenses,

    available: Math.max(0, income - expenses),

  };

}, [store.income, store.expenses]);

  const openGoal = (editing?: Goal) => {

    setError("");

    setForm(

      editing

        ? {

            name: editing.name,

            category: editing.category,

            target: String(editing.target),

            saved: String(editing.saved),

            targetDate: editing.targetDate ?? "",

          }

        : { name: "", category: GOAL_CATEGORIES[0], target: "", saved: "0", targetDate: "" },

    );

    setModal({ open: true, editing: editing ?? null });

  };



  const saveGoal = (e: React.FormEvent) => {

    e.preventDefault();

    const target = parseAmount(form.target);

    const saved = parseAmount(form.saved);

    if (!form.name.trim()) {

      setError("Give your goal a name.");

      return;

    }

    if (!Number.isFinite(target) || target <= 0) {

      setError("Enter a target amount greater than zero.");

      return;

    }

    const payload = {

      name: form.name.trim(),

      category: form.category,

      target,

      saved,

      targetDate: form.targetDate || undefined,

    };

    if (modal.editing) store.updateGoal(modal.editing.id, payload);

    else store.addGoal(payload);

    setModal({ open: false, editing: null });

  };



  const addContribution = (e: React.FormEvent) => {

    e.preventDefault();

    const amount = parseAmount(contribAmount);

    if (!contribModal.goal || !Number.isFinite(amount) || amount <= 0) {

      setError("Enter a contribution amount greater than zero.");

      return;

    }

    const goal = contribModal.goal;

    store.updateGoal(goal.id, { saved: Math.min(goal.target, goal.saved + amount) });

    setContribModal({ open: false, goal: null });

    setContribAmount("");

  };



  const calcTarget = parseAmount(calc.target);

  const calcMonths = Math.max(1, parseAmount(calc.months) || 1);

  const perMonth = Number.isFinite(calcTarget) ? calcTarget / calcMonths : NaN;



  const suggestion =

  monthlyFinances.income > 0

    ? Math.max(

        0,

        Math.min(

          Math.round(monthlyFinances.income * 0.1),

          Math.round(monthlyFinances.available * 0.2)

        )

      )

    : 0;

  return (

    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>

          <h2 className="text-xl font-bold tracking-tight">SafePocket</h2>

          <p className="text-sm text-muted-foreground">

            Flexible savings goals and progress tracking — simulated demo data.

          </p>

        </div>

        <Button onClick={() => openGoal()}>

          <Plus className="h-4 w-4" /> Create Goal

        </Button>

      </div>



      <div className="grid gap-4 lg:grid-cols-3">

        <Card className="lg:col-span-2">

          <div className="flex items-center gap-2">

            <PiggyBank className="h-5 w-5 text-primary" />

            <CardTitle>Your Goals</CardTitle>

            <Badge tone="brand" className="ml-auto">

              {totals.pct}% saved overall

            </Badge>

          </div>

          <Progress value={totals.pct} className="mt-3" />

          <p className="mt-2 text-xs text-muted-foreground">

            {formatZAR(totals.saved)} saved of {formatZAR(totals.target)} across all goals.

          </p>



          <div className="mt-5 space-y-3">

            {store.goals.length === 0 && (

              <EmptyState

                icon={<PiggyBank className="h-8 w-8" />}

                title="No savings goals yet"

                body="Create your first goal — an emergency fund is a great place to start."

              />

            )}

            {store.goals.map((g) => {

              const pct = g.target > 0 ? Math.min(100, Math.max(0, Math.round((g.saved / g.target) * 100))) : 0;

              const remaining = Math.max(0, g.target - g.saved);

              return (

                <div key={g.id} className="rounded-2xl border border-border p-4">

                  <div className="flex flex-wrap items-start justify-between gap-2">

                    <div>

                      <p className="font-bold">{g.name}</p>

                      <p className="text-xs text-muted-foreground">

                        {g.category}

                        {g.targetDate ? ` · Target date ${formatDate(g.targetDate)}` : ""}

                      </p>

                    </div>

                    <div className="flex items-center gap-1">

                      <Button

                        size="sm"

                        variant="mint"

                        onClick={() => {

                          setContribModal({ open: true, goal: g });

                          setError("");

                          setContribAmount("");

                        }}

                      >

                        <Plus className="h-3.5 w-3.5" /> Add

                      </Button>

                      <button

                        onClick={() => openGoal(g)}

                        aria-label={`Edit goal ${g.name}`}

                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted"

                      >

                        <Pencil className="h-4 w-4" />

                      </button>

                      <button

                        onClick={() => store.removeGoal(g.id)}

                        aria-label={`Delete goal ${g.name}`}

                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"

                      >

                        <Trash2 className="h-4 w-4" />

                      </button>

                    </div>

                  </div>

                  <Progress value={pct} className="mt-3" />

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs">

                    <span className="font-semibold">

                      {formatZAR(g.saved)} of {formatZAR(g.target)}

                    </span>

                    <span

                      className={

                        pct >= 100 ? "font-semibold text-primary" : "text-muted-foreground"

                      }

                    >

                      {pct >= 100 ? "Goal reached!" : `${formatZAR(remaining)} to go · ${pct}%`}

                    </span>

                  </div>

                </div>

              );

            })}

          </div>

          <p className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">

            SafePocket is a savings planning and tracking tool. It does not store or move real money

            — your savings stay wherever you choose to keep them.

          </p>

        </Card>



        <div className="space-y-4">

          <Card>

            <div className="flex items-center gap-2">

              <Target className="h-5 w-5 text-accent" />

              <CardTitle>Savings Calculator</CardTitle>

            </div>

            <div className="mt-4 space-y-3">

              <div>

                <Label htmlFor="calc-target">Goal amount (ZAR)</Label>

                <Input

                  id="calc-target"

                  inputMode="decimal"

                  value={calc.target}

                  onChange={(e) => setCalc({ ...calc, target: e.target.value })}

                />

              </div>

              <div>

                <Label htmlFor="calc-months">Months to save</Label>

                <Input

                  id="calc-months"

                  inputMode="numeric"

                  value={calc.months}

                  onChange={(e) => setCalc({ ...calc, months: e.target.value })}

                />

              </div>

              <div className="rounded-xl bg-primary/10 p-3.5 text-sm">

                <p className="text-muted-foreground">You would need to save</p>

                <p className="text-xl font-extrabold text-primary">

                  {Number.isFinite(perMonth) ? `${formatZAR(perMonth)} / month` : "—"}

                </p>

              </div>

            </div>

          </Card>



          <Card>

            <div className="flex items-center gap-2">

              <TrendingUp className="h-5 w-5 text-primary" />

              <CardTitle>Flexible Suggestions</CardTitle>

            </div>

            <ul className="mt-3 space-y-2.5 text-sm">

              <li className="rounded-xl bg-muted p-3">

                {suggestion > 0 ? (
                  <>
                    Based on your recorded income and expenses this month, you could
                    consider saving up to{" "}
                    <span className="font-bold">{formatZAR(suggestion)}</span>,
                    provided your essential expenses and upcoming bills are covered.
                  </>
                ) : (
                  <>
                    Your recorded finances do not currently support an additional
                    savings contribution. Focus on essential expenses first and
                    save when you have money available.
                  </>
                )}

              </li>

              <li className="rounded-xl bg-muted p-3">

                Save irregular amounts any time — even R50 a week grows to {formatZAR(2600)} over a

                year.

              </li>

              <li className="rounded-xl bg-muted p-3">

                Your emergency fund should come first — it protects every other goal.

              </li>

            </ul>

          </Card>

        </div>

      </div>



      {/* Goal modal */}

      <Modal

        open={modal.open}

        onClose={() => setModal({ open: false, editing: null })}

        title={modal.editing ? "Edit Goal" : "Create Savings Goal"}

      >

        <form onSubmit={saveGoal} className="space-y-4">

          <div>

            <Label htmlFor="g-name">Goal name</Label>

            <Input

              id="g-name"

              placeholder="e.g. Emergency Fund"

              value={form.name}

              onChange={(e) => setForm({ ...form, name: e.target.value })}

            />

          </div>

          <div>

            <Label htmlFor="g-cat">Category</Label>

            <Select

              id="g-cat"

              value={form.category}

              onChange={(e) => setForm({ ...form, category: e.target.value })}

            >

              {GOAL_CATEGORIES.map((c) => (

                <option key={c}>{c}</option>

              ))}

            </Select>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <Label htmlFor="g-target">Target (ZAR)</Label>

              <Input

                id="g-target"

                inputMode="decimal"

                placeholder="e.g. 6000"

                value={form.target}

                onChange={(e) => setForm({ ...form, target: e.target.value })}

              />

            </div>

            <div>

              <Label htmlFor="g-saved">Already saved (ZAR)</Label>

              <Input

                id="g-saved"

                inputMode="decimal"

                value={form.saved}

                onChange={(e) => setForm({ ...form, saved: e.target.value })}

              />

            </div>

          </div>

          <div>

            <Label htmlFor="g-date">Target date (optional)</Label>

            <Input

              id="g-date"

              type="date"

              value={form.targetDate}

              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}

            />

          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <Button type="submit" className="w-full">

            {modal.editing ? "Save Changes" : "Create Goal"}

          </Button>

        </form>

      </Modal>



      {/* Contribution modal */}

      <Modal

        open={contribModal.open}

        onClose={() => setContribModal({ open: false, goal: null })}

        title={`Add to ${contribModal.goal?.name ?? ""}`}

      >

        <form onSubmit={addContribution} className="space-y-4">

          <div>

            <Label htmlFor="c-amount">Contribution (ZAR)</Label>

            <Input

              id="c-amount"

              inputMode="decimal"

              placeholder="e.g. 250"

              value={contribAmount}

              onChange={(e) => setContribAmount(e.target.value)}

            />

          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <Button type="submit" variant="mint" className="w-full">

            Add Contribution

          </Button>

          <p className="text-center text-[11px] text-muted-foreground">

            Demo tracking only — no real money moves.

          </p>

        </form>

      </Modal>

    </div>

  );

}
