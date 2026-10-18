import { authorizeCompany, parseAmount, sumAmounts } from "@fortnox-mcp/core";
import { describe, expect, it } from "vitest";

describe("exact decimal boundary", () => {
  it("sums fractional and large amounts without a float intermediate", () => {
    expect(sumAmounts(["0.10", "0.20"], 2)).toBe("0.30");
    expect(sumAmounts(["9007199254740993.01", "0.01"], 2)).toBe(
      "9007199254740993.02",
    );
    expect(sumAmounts(["1250.00", "-1200.00"], 2)).toBe("50.00");
    expect(
      sumAmounts(["0.000000000000000001", "0.000000000000000002"], 18),
    ).toBe("0.000000000000000003");
    expect(parseAmount("-0.00", 2)).toBe("0.00");
  });
  it.each([
    NaN,
    Infinity,
    0.1,
    "NaN",
    "Infinity",
    "1e2",
    " 1.00",
    "01.00",
    "0.001",
    "9".repeat(49),
  ])("rejects invalid or lossy amount %s", (input) => {
    expect(() => parseAmount(input, 2)).toThrow("VALIDATION_FAILED");
  });
  it("requires an explicit supported scale", () => {
    for (const scale of [-1, 19, 1.5, NaN])
      expect(() => parseAmount("1", scale)).toThrow();
    expect(parseAmount("1.2300", 2)).toBe("1.23");
    expect(() => sumAmounts(Array(10_001).fill("0"), 2)).toThrow();
  });
});

it("resolves company authorization from server identity", () => {
  const identity = { ownerId: "owner_a", companyIds: ["company_a"] };
  expect(authorizeCompany(identity, "company_a")).toEqual({
    ownerId: "owner_a",
    companyId: "company_a",
  });
  expect(() => authorizeCompany(identity, "company_b")).toThrow(
    "COMPANY_FORBIDDEN",
  );
});
