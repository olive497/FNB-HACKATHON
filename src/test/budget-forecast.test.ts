
import { describe, expect, it } from "vitest";
import { calculateBudgetForecast } from "../lib/budget-forecast";
import { seedIncome, seedExpenses } from "../lib/demo-data";

describe("SafeBank budget forecasting", () => {
  it("forecasts November using August to October data", () => {
    const forecast = calculateBudgetForecast(
      seedIncome,
      seedExpenses,
      "2026-10"
    );

    expect(forecast).not.toBeNull();
    expect(forecast?.estimatedIncome).toBe(9150);
    expect(forecast?.estimatedExpenses).toBe(6623);
    expect(forecast?.projectedBalance).toBe(2527);
    expect(forecast?.conservativeIncome).toBe(8600);
    expect(forecast?.riskLevel).toBe("moderate");
  });

  it("does not forecast without sufficient history", () => {
    const forecast = calculateBudgetForecast(
      seedIncome,
      seedExpenses,
      "2026-11"
    );

    expect(forecast).toBeNull();
  });
});
