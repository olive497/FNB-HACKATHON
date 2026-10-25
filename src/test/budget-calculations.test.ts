
import { describe, expect, it } from "vitest";
import { seedIncome, seedExpenses } from "../lib/demo-data";
import {
  filterByMonth,
  calculateMonthlyTotals,
  calculateWeeklyIncome,
} from "../lib/budget-calculations";

describe("SafeBank SmartBudget calculations", () => {
  it.each([
    ["2026-08", 9050, 6620],
    ["2026-09", 9800, 6895],
    ["2026-10", 8600, 6355],
  ])(
    "calculates correct income and expenses for %s",
    (month, expectedIncome, expectedExpenses) => {
      const totals = calculateMonthlyTotals(
        seedIncome,
        seedExpenses,
        month
      );

      expect(totals.income).toBe(expectedIncome);
      expect(totals.expenses).toBe(expectedExpenses);
    }
  );

  it("excludes transactions from other months", () => {
    const september = filterByMonth(seedIncome, "2026-09");

    expect(september).toHaveLength(2);
    expect(september.every((item) => item.date.startsWith("2026-09"))).toBe(true);
  });

  it("calculates September weekly income correctly", () => {
    const weeks = calculateWeeklyIncome(seedIncome, "2026-09");

    expect(weeks.map((week) => week.total)).toEqual([
      7200,
      2600,
      0,
      0,
      0,
    ]);
  });

  it("calculates October weekly income correctly", () => {
    const weeks = calculateWeeklyIncome(seedIncome, "2026-10");

    expect(weeks.map((week) => week.total)).toEqual([
      7200,
      1400,
      0,
      0,
      0,
    ]);
  });

  it("returns zero totals for a month without transactions", () => {
    const totals = calculateMonthlyTotals(
      seedIncome,
      seedExpenses,
      "2026-11"
    );

    expect(totals).toEqual({ income: 0, expenses: 0 });
  });
});
