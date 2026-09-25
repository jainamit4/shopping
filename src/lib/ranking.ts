import type { Category, CompareOption, Recommendation, RetailerId } from "./types";

const CATEGORY_AFFINITY: Record<Category, Partial<Record<RetailerId, number>>> = {
  groceries: { giant: 24, walmart: 22, costco: 20, bjs: 18, target: 16, amazon: 12 },
  household: { walmart: 22, target: 20, costco: 18, bjs: 16, amazon: 15, homedepot: 12, giant: 10 },
  clothes: { target: 22, amazon: 20, walmart: 16, costco: 12 },
  hardware: { homedepot: 24, lowes: 23, walmart: 14, amazon: 12, costco: 10 },
  electronics: { bestbuy: 24, amazon: 20, walmart: 16, target: 14, costco: 12 },
  hotels: { booking: 22, "hotels-com": 20 },
  flights: { "google-flights": 26, "airline-search": 18 },
  general: { amazon: 18, walmart: 17, target: 15, costco: 12 },
};

export function heuristicScore(
  retailerId: RetailerId,
  category: Category,
  opts: { membership?: boolean; budget?: number; zipSensitive?: boolean; hasZip?: boolean },
): number {
  let score = CATEGORY_AFFINITY[category]?.[retailerId] ?? 8;
  if (opts.membership && (opts.budget === undefined || opts.budget < 60)) {
    score -= 6;
  }
  if (opts.zipSensitive && opts.hasZip) {
    score += 3;
  }
  return score;
}

export function sortOptions(options: CompareOption[]): CompareOption[] {
  const priced = options.filter((option) => option.price?.amount != null);
  return [...options].sort((a, b) => {
    const aPrice = a.price?.amount;
    const bPrice = b.price?.amount;
    if (aPrice != null && bPrice != null && aPrice !== bPrice) return aPrice - bPrice;
    if (aPrice != null && bPrice == null && priced.length >= 2) return -1;
    if (aPrice == null && bPrice != null && priced.length >= 2) return 1;
    return b.heuristicScore - a.heuristicScore;
  });
}

export function recommend(options: CompareOption[], category: Category): Recommendation | null {
  if (options.length === 0) return null;
  const ranked = sortOptions(options);
  const pick = ranked[0];
  const priced = ranked.filter((option) => option.price?.amount != null);
  const usedExamplePrices = priced.length > 0;

  let explanation: string;
  if (usedExamplePrices) {
    const amount = pick.price ? formatUsd(pick.price.amount) : "n/a";
    const others = priced
      .slice(1, 3)
      .map((option) => `${option.retailer.shortName} ${formatUsd(option.price!.amount)}`)
      .join(", ");
    explanation = `${pick.retailer.name} has the lowest EXAMPLE price (${amount}${pick.price?.unit ? `, ${pick.price.unit}` : ""}).${
      others ? ` Next listed: ${others}.` : ""
    } These figures are fixture data, not live store prices — open the Buy link and confirm the cart.`;
    if (pick.membershipNote) {
      explanation += ` ${pick.retailer.shortName} may require a membership, so a one-off purchase can cost more than the shelf price.`;
    }
  } else {
    explanation = `No live prices are available, so this pick is a category heuristic for ${category}: ${pick.retailer.name} is typically a strong first stop. ${pick.reasons[0] ?? ""} Open each Buy link and compare the live cart yourself.`;
  }

  if (pick.coupon?.code && pick.coupon.isExample) {
    explanation += " An example coupon is attached for UI demo only — do not assume it works at checkout.";
  } else if (pick.coupon?.code) {
    explanation += " A user-supplied code is attached; verify the source and expiry before paying.";
  }

  return {
    retailerId: pick.retailer.id,
    headline: usedExamplePrices
      ? `Lowest example price: ${pick.retailer.shortName}`
      : `Suggested first stop: ${pick.retailer.shortName}`,
    explanation,
    usedExamplePrices,
  };
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
