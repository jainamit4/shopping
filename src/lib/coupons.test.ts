import { describe, expect, it } from "vitest";
import { evaluateCoupon, getCouponHelp } from "./coupons";
import { compare } from "./compare";

describe("coupon helper", () => {
  it("never invents a code when none is supplied", () => {
    const help = getCouponHelp("amazon", "hdmi cable", "electronics");
    expect(help.codes).toEqual([]);
    expect(help.placeholders).toHaveLength(1);
    expect(help.officialPromo.url).toContain("amazon.com");
    expect(help.aggregators.length).toBeGreaterThanOrEqual(2);
  });

  it("returns fixture codes only when query and store match, marked as examples", () => {
    const help = getCouponHelp("target", "Bounty paper towels", "household");
    expect(help.codes[0]?.code).toBe("CIRCLE10");
    expect(help.codes[0]?.isExample).toBe(true);
    expect(help.codes[0]?.sourceUrl).toMatch(/^https?:\/\//);
  });

  it("accepts a user-pasted code without marking it as a fixture", () => {
    const help = getCouponHelp("walmart", "trash bags", "household", [
      {
        store: "walmart",
        code: "USERPASTE",
        sourceUrl: "https://www.walmart.com/shop/deals",
        expiry: "2026-10-01",
      },
    ]);
    expect(help.codes[0]?.code).toBe("USERPASTE");
    expect(help.codes[0]?.isExample).toBe(false);
  });

  it("builds a verification checklist", () => {
    const list = evaluateCoupon(
      {
        code: "CIRCLE10",
        sourceUrl: "https://www.target.com/circle",
        expiry: "2026-12-31",
        categoryMatch: ["household"],
        isExample: true,
      },
      "household",
    );
    expect(list.hasCode).toBe(true);
    expect(list.hasSourceUrl).toBe(true);
    expect(list.hasExpiry).toBe(true);
    expect(list.categoryMatches).toBe(true);
    expect(list.items.find((item) => item.id === "verify")?.ok).toBe(false);
  });
});

describe("compare + recommend", () => {
  it("ranks known example prices lowest-first and explains the pick", () => {
    const result = compare({ query: "Bounty paper towels", category: "household" });
    const priced = result.options.filter((option) => option.price);
    expect(priced[0]?.retailer.id).toBe("walmart");
    expect(priced[0]?.price?.isExample).toBe(true);
    expect(result.recommendation?.retailerId).toBe("walmart");
    expect(result.recommendation?.usedExamplePrices).toBe(true);
    expect(result.recommendation?.explanation).toMatch(/EXAMPLE/i);
  });

  it("does not fabricate prices for unknown queries", () => {
    const result = compare({ query: "obscure widget xyz-9911" });
    expect(result.options.every((option) => option.price === undefined)).toBe(true);
    expect(result.recommendation?.usedExamplePrices).toBe(false);
  });

  it("routes flight queries to travel link builders", () => {
    const result = compare({ query: "BOS to SFO" });
    expect(result.category).toBe("flights");
    const flights = result.options.find((option) => option.retailer.id === "google-flights");
    expect(flights?.buyUrl).toContain("google.com/travel/flights");
  });
});
