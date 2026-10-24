const r2 = (n) => Math.round(n * 100) / 100;

export function savingsPlan({ target, saved = 0, months, monthly }) {
  const remaining = Math.max(0, target - saved);
  const out = { target, saved, remaining, progressPct: target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0 };
  if (months) {
    out.months = months;
    out.perMonth = r2(remaining / months);
    out.perWeek = r2(remaining / (months * 4.345));
  }
  if (monthly) {
    out.monthly = monthly;
    out.monthsNeeded = remaining === 0 ? 0 : Math.ceil(remaining / monthly);
  }
  return out;
}

// Month-by-month payoff simulation. Strategy decides where `extra` rand goes first.
export function simulateDebts(debts, extra = 0, strategy = "avalanche") {
  const list = debts.map((d) => ({ ...d, balance: d.balance }));
  const order = [...list].sort((a, b) =>
    strategy === "snowball" ? a.balance - b.balance : b.rate - a.rate,
  );
  let month = 0;
  let totalInterest = 0;
  const payoffMonth = {};
  while (list.some((d) => d.balance > 0.005) && month < 600) {
    month++;
    let freed = extra;
    for (const d of list) {
      if (d.balance <= 0.005) { freed += d.monthlyPayment; continue; }
    }
    // interest first
    for (const d of list) {
      if (d.balance <= 0.005) continue;
      const interest = d.balance * (d.rate / 100 / 12);
      d.balance += interest;
      totalInterest += interest;
    }
    // minimum payments
    for (const d of list) {
      if (d.balance <= 0.005) continue;
      const pay = Math.min(d.balance, d.monthlyPayment);
      d.balance -= pay;
      if (d.balance <= 0.005 && !payoffMonth[d.id ?? d.name]) payoffMonth[d.id ?? d.name] = month;
    }
    // snowball/avalanche extra: priority debt gets freed + extra money
    let pool = freed;
    for (const d of order) {
      if (pool <= 0) break;
      if (d.balance <= 0.005) continue;
      const pay = Math.min(d.balance, pool);
      d.balance -= pay;
      pool -= pay;
      if (d.balance <= 0.005 && !payoffMonth[d.id ?? d.name]) payoffMonth[d.id ?? d.name] = month;
    }
  }
  const stuck = list.filter((d) => d.balance > 0.005);
  return {
    strategy,
    extra,
    months: stuck.length ? null : month,
    totalInterest: r2(totalInterest),
    payoffMonths: payoffMonth,
    neverCleared: stuck.map((d) => d.name),
  };
}

export function debtPlan(debts, extra = 0) {
  const perDebt = debts.map((d) => {
    const monthlyRate = d.rate / 100 / 12;
    const interestOnly = d.balance * monthlyRate;
    const sim = simulateDebts([d], 0, "avalanche");
    return {
      id: d.id,
      name: d.name,
      balance: d.balance,
      monthlyPayment: d.monthlyPayment,
      monthsToClear: sim.months,
      totalInterest: sim.totalInterest,
      warning: d.monthlyPayment <= interestOnly ? "Payment does not cover monthly interest - the balance will never clear." : undefined,
    };
  });
  return {
    perDebt,
    totalBalance: r2(debts.reduce((a, d) => a + d.balance, 0)),
    totalMonthlyPayments: r2(debts.reduce((a, d) => a + d.monthlyPayment, 0)),
    avalanche: simulateDebts(debts, extra, "avalanche"),
    snowball: simulateDebts(debts, extra, "snowball"),
    disclaimer: "Illustrative only - real interest, fees and settlement quotes come from your credit provider.",
  };
}

export function monthKey(iso) {
  return iso.slice(0, 7);
}

export function monthlyTotals(income, expenses) {
  const map = new Map();
  const touch = (k) => map.get(k) ?? map.set(k, { month: k, income: 0, expenses: 0 }).get(k);
  for (const i of income) touch(monthKey(i.date)).income += i.amount;
  for (const e of expenses) touch(monthKey(e.date)).expenses += e.amount;
  return [...map.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ ...m, balance: r2(m.income - m.expenses) }));
}

export function categoryTotals(expenses, month) {
  const t = {};
  for (const e of expenses) if (!month || monthKey(e.date) === month) t[e.category] = (t[e.category] ?? 0) + e.amount;
  return t;
}

export function irregularIncome(income) {
  const months = monthlyTotals(income, []).map((m) => m.income);
  if (!months.length) return { lowestMonth: 0, averageMonth: 0, months: 0 };
  const lowest = Math.min(...months);
  const avg = months.reduce((a, b) => a + b, 0) / months.length;
  return {
    months: months.length,
    lowestMonth: r2(lowest),
    averageMonth: r2(avg),
    baseBudget: r2(lowest),
    extraAboveBase: r2(Math.max(0, avg - lowest)),
    suggestedSplitOfExtra: { savings: 0.5, debt: 0.3, self: 0.2 },
    tip: "Build your essential budget on your lowest month. Decide in advance where anything above it goes.",
  };
}
