
import type { Income, Expense } from "./demo-data";

export function calculateBudgetForecast(
  income: Income[],
  expenses: Expense[],
  selectedMonth: string
) {
  const [year, month] = selectedMonth.split("-").map(Number);

  const months = [2, 1, 0].map((back) => {
    const date = new Date(year, month - 1 - back, 1);

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const monthlyIncome = months.map((key) =>
    income
      .filter((item) => item.date.slice(0, 7) === key)
      .reduce((total, item) => total + item.amount, 0)
  );

  const monthlyExpenses = months.map((key) =>
    expenses
      .filter((item) => item.date.slice(0, 7) === key)
      .reduce((total, item) => total + item.amount, 0)
  );

  const hasEnoughHistory = months.every((_, index) => {
  return (
    income.some((item) => item.date.slice(0, 7) === months[index]) &&
    expenses.some((item) => item.date.slice(0, 7) === months[index])
  );
});

if (!hasEnoughHistory) {
  return null;
}

  const average = (values: number[]) =>
    values.reduce((total, value) => total + value, 0) /
    values.length;

  const estimatedIncome = Math.round(average(monthlyIncome));
  const estimatedExpenses = Math.round(average(monthlyExpenses));

  const conservativeIncome = Math.min(...monthlyIncome);

  const projectedBalance = estimatedIncome - estimatedExpenses;

  const conservativeBalance =
    conservativeIncome - estimatedExpenses;

  const incomeVariation =
    Math.max(...monthlyIncome) - Math.min(...monthlyIncome);

  const riskLevel =
    conservativeBalance < 0
      ? "high"
      : incomeVariation > 1000
        ? "moderate"
        : "low";

  return {
    estimatedIncome,
    estimatedExpenses,
    projectedBalance,
    conservativeIncome,
    conservativeBalance,
    incomeVariation,
    riskLevel,
    monthsAnalysed: months,
  };
}
