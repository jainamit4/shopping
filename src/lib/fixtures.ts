import type { Category, CouponRecord, ExamplePrice, RetailerId } from "./types";

export interface PriceFixture {
  id: string;
  store: RetailerId;
  queryMatch: string[];
  category?: Category;
  title: string;
  price: ExamplePrice;
  notes?: string;
}

/**
 * EXAMPLE DATA only. Used to demonstrate ranking and coupon UI.
 * Never treat these as live store prices or working checkout codes.
 */
export const EXAMPLE_PRICES: PriceFixture[] = [
  {
    id: "ex-paper-amazon",
    store: "amazon",
    queryMatch: ["paper towel", "bounty", "brawny"],
    category: "household",
    title: "Bounty paper towels (search match)",
    price: { amount: 24.99, currency: "USD", unit: "12 double rolls", isExample: true },
  },
  {
    id: "ex-paper-walmart",
    store: "walmart",
    queryMatch: ["paper towel", "bounty", "brawny"],
    category: "household",
    title: "Bounty paper towels (search match)",
    price: { amount: 18.47, currency: "USD", unit: "12 double rolls", isExample: true },
  },
  {
    id: "ex-paper-target",
    store: "target",
    queryMatch: ["paper towel", "bounty", "brawny"],
    category: "household",
    title: "Bounty paper towels (search match)",
    price: { amount: 19.99, currency: "USD", unit: "12 double rolls", isExample: true },
  },
  {
    id: "ex-paper-costco",
    store: "costco",
    queryMatch: ["paper towel", "bounty", "brawny", "kirkland paper"],
    category: "household",
    title: "Kirkland / Bounty paper towels (search match)",
    price: { amount: 21.99, currency: "USD", unit: "12 mega rolls, membership", isExample: true },
  },
  {
    id: "ex-paper-bjs",
    store: "bjs",
    queryMatch: ["paper towel", "bounty", "brawny"],
    category: "household",
    title: "Bounty paper towels (search match)",
    price: { amount: 20.49, currency: "USD", unit: "12 double rolls, membership", isExample: true },
  },
  {
    id: "ex-fryer-amazon",
    store: "amazon",
    queryMatch: ["air fryer", "ninja air"],
    category: "electronics",
    title: "Ninja air fryer (search match)",
    price: { amount: 119.99, currency: "USD", isExample: true },
  },
  {
    id: "ex-fryer-walmart",
    store: "walmart",
    queryMatch: ["air fryer", "ninja air"],
    category: "electronics",
    title: "Ninja air fryer (search match)",
    price: { amount: 99.0, currency: "USD", isExample: true },
  },
  {
    id: "ex-fryer-target",
    store: "target",
    queryMatch: ["air fryer", "ninja air"],
    category: "electronics",
    title: "Ninja air fryer (search match)",
    price: { amount: 109.99, currency: "USD", isExample: true },
  },
  {
    id: "ex-fryer-bestbuy",
    store: "bestbuy",
    queryMatch: ["air fryer", "ninja air"],
    category: "electronics",
    title: "Ninja air fryer (search match)",
    price: { amount: 104.99, currency: "USD", isExample: true },
  },
  {
    id: "ex-paint-hd",
    store: "homedepot",
    queryMatch: ["interior paint", "eggshell paint", "behr paint"],
    category: "hardware",
    title: "Interior paint (search match)",
    price: { amount: 38.98, currency: "USD", unit: "1 gallon", isExample: true },
  },
  {
    id: "ex-paint-lowes",
    store: "lowes",
    queryMatch: ["interior paint", "eggshell paint", "behr paint", "valspar"],
    category: "hardware",
    title: "Interior paint (search match)",
    price: { amount: 36.98, currency: "USD", unit: "1 gallon", isExample: true },
  },
  {
    id: "ex-paint-walmart",
    store: "walmart",
    queryMatch: ["interior paint", "eggshell paint"],
    category: "hardware",
    title: "Interior paint (search match)",
    price: { amount: 32.0, currency: "USD", unit: "1 gallon", isExample: true },
  },
];

export const EXAMPLE_COUPONS: CouponRecord[] = [
  {
    id: "ex-target-circle-household",
    store: "target",
    code: "CIRCLE10",
    isExample: true,
    sourceUrl: "https://www.target.com/circle",
    sourceLabel: "Target Circle (example fixture)",
    expiry: "2026-12-31",
    categoryMatch: ["household", "groceries", "clothes"],
    queryMatch: ["paper towel", "laundry", "air fryer"],
    notes: "EXAMPLE DATA — not a live checkout code. Shown only to demonstrate the coupon field.",
  },
  {
    id: "ex-homedepot-paint",
    store: "homedepot",
    code: "SAVE10PAINT",
    isExample: true,
    sourceUrl: "https://www.homedepot.com/c/Special_Values",
    sourceLabel: "Home Depot Special Values (example fixture)",
    expiry: "2026-11-15",
    categoryMatch: ["hardware"],
    queryMatch: ["paint", "behr"],
    notes: "EXAMPLE DATA — verify on the official promo page before checkout.",
  },
  {
    id: "ex-bestbuy-mybestbuy",
    store: "bestbuy",
    code: "MYBESTBUY20",
    isExample: true,
    sourceUrl: "https://www.bestbuy.com/site/electronics/top-deals/pcmcat156500050013.c",
    sourceLabel: "Best Buy Top Deals (example fixture)",
    expiry: "2026-10-31",
    categoryMatch: ["electronics"],
    queryMatch: ["air fryer", "tv", "laptop"],
    notes: "EXAMPLE DATA — membership/app offers change frequently.",
  },
];

export function normalizeHaystack(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+ ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function matchesQuery(haystack: string, needles: string[]): boolean {
  const hay = normalizeHaystack(haystack);
  return needles.some((needle) => hay.includes(normalizeHaystack(needle)));
}

export function findExamplePrice(store: RetailerId, query: string): PriceFixture | undefined {
  return EXAMPLE_PRICES.find((row) => row.store === store && matchesQuery(query, row.queryMatch));
}

export function findExampleCoupons(store: RetailerId, query: string, category?: Category): CouponRecord[] {
  return EXAMPLE_COUPONS.filter((row) => {
    if (row.store !== store) return false;
    const queryHit = row.queryMatch && row.queryMatch.length > 0 ? matchesQuery(query, row.queryMatch) : false;
    if (queryHit) return true;
    if (row.queryMatch && row.queryMatch.length > 0) return false;
    if (row.categoryMatch && category) return row.categoryMatch.includes(category);
    return false;
  });
}
