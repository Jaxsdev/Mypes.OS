import { describe, expect, it } from "vitest";
import { conditionMatches, MYPE_RULE_TEMPLATES, type RuleSubject } from "../src/finance/rules.ts";

describe("MypesOS Business Rules Templates", () => {
  it("includes preconfigured rule templates for Latin American expenses", () => {
    expect(MYPE_RULE_TEMPLATES.length).toBeGreaterThanOrEqual(7);

    const electricity = MYPE_RULE_TEMPLATES.find((t) => t.name.includes("Luz"));
    expect(electricity).toBeDefined();
    expect(electricity?.keywords).toContain("enel");
    expect(electricity?.keywords).toContain("luz del sur");

    const taxes = MYPE_RULE_TEMPLATES.find((t) => t.name.includes("Tributos"));
    expect(taxes).toBeDefined();
    expect(taxes?.keywords).toContain("sunat");
  });

  it("matches business rule subjects with keyword conditions", () => {
    const subject: RuleSubject = {
      description: "PAGO MENSUAL ENEL PERU SAA",
      merchant: "Enel",
      amount: 15400,
      currency: "PEN",
    };

    const condition = {
      field: "description" as const,
      operator: "contains" as const,
      value: "enel",
    };

    expect(conditionMatches(subject, condition)).toBe(true);
  });
});

