
import type { Income, Expense } from "./demo-data";

export function filterByMonth<T extends { date: string }>(
  transactions: T[],
  selectedMonth: string
): T[] {
  return transactions.filter(
    (transaction) => transaction.date.slice(0, 7) === selectedMonth
  );
}

export function calculateMonthlyTotals(
  income: Income[],
  expenses: Expense[],
  selectedMonth: string
) {
  const monthlyIncome = filterByMonth(income, selectedMonth);
  const monthlyExpenses = filterByMonth(expenses, selectedMonth);

  return {
    income: monthlyIncome.reduce((sum, item) => sum + item.amount, 0),
    expenses: monthlyExpenses.reduce((sum, item) => sum + item.amount, 0),
  };
}

export function calculateWeeklyIncome(
  income: Income[],
  selectedMonth: string
) {
  const monthlyIncome = filterByMonth(income, selectedMonth);
  const byWeek = new Map<number, number>();

  for (const item of monthlyIncome) {
    const day = Number(item.date.slice(8, 10));
    const week = Math.floor((day - 1) / 7) + 1;

    byWeek.set(week, (byWeek.get(week) ?? 0) + item.amount);
  }

  const daysInMonth = new Date(
    Number(selectedMonth.slice(0, 4)),
    Number(selectedMonth.slice(5, 7)),
    0
  ).getDate();

  return Array.from(
    { length: Math.ceil(daysInMonth / 7) },
    (_, index) => {
      const week = index + 1;

      return {
        label: `Week ${week}`,
        days: `${index * 7 + 1}–${Math.min(week * 7, daysInMonth)}`,
        total: byWeek.get(week) ?? 0,
      };
    }
  );
}
