
import { describe, expect, it } from "vitest";
import { analyseMessage } from "../lib/demo-data";

describe("ScamShield message analysis", () => {
  it("keeps risk scores between 0 and 100", () => {
    const message =
      "URGENT! Your bank account is blocked. " +
      "Verify your OTP and PIN immediately. " +
      "Click http://fake-bank.xyz to claim your prize.";

    const result = analyseMessage(message);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns low risk when no rules match", () => {
    const result = analyseMessage(
      "Hello, our meeting is tomorrow afternoon."
    );

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.detected).toHaveLength(0);
  });

  it("classifies the result consistently with its score", () => {
    const result = analyseMessage(
      "URGENT! Verify your OTP and PIN now."
    );

    const expectedLevel =
      result.score >= 50
        ? "high"
        : result.score >= 20
          ? "medium"
          : "low";

    expect(result.level).toBe(expectedLevel);
  });
});
