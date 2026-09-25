import { getCouponHelp } from "./coupons";
import { findExamplePrice } from "./fixtures";
import { extraLinksFor, buildSearchUrl } from "./links";
import { heuristicScore, recommend, sortOptions } from "./ranking";
import { resolveRetailers } from "./retailers";
import type { Category, CompareOption, CompareResult, PastedCoupon, SearchContext } from "./types";
import { CATEGORIES } from "./types";

const FLIGHT_HINT = /\b(flight|flights|airfare|airline|[A-Z]{3}\s*(to|-|→)\s*[A-Z]{3})\b/i;
const HOTEL_HINT = /\bhotels?\b/i;

export function inferCategory(query: string, explicit?: Category): Category {
  if (explicit) return explicit;
  if (FLIGHT_HINT.test(query)) return "flights";
  if (HOTEL_HINT.test(query)) return "hotels";
  if (/\b(paint|drill|lumber|plywood|screwdriver|hammer)\b/i.test(query)) return "hardware";
  if (/\b(air fryer|laptop|tv|headphones|iphone|ipad)\b/i.test(query)) return "electronics";
  if (/\b(milk|eggs|bread|grocery|bananas|chicken)\b/i.test(query)) return "groceries";
  if (/\b(paper towel|detergent|trash bag|laundry|cleaner)\b/i.test(query)) return "household";
  if (/\b(jeans|shirt|sneakers|dress|hoodie)\b/i.test(query)) return "clothes";
  return "general";
}

export function isCategory(value: string | undefined): value is Category {
  return Boolean(value && (CATEGORIES as readonly string[]).includes(value));
}

export function compare(ctx: SearchContext, pasted: PastedCoupon[] = []): CompareResult {
  const query = ctx.query.trim();
  const category = inferCategory(query, ctx.category);
  const retailers = resolveRetailers(ctx.retailerIds, category);
  const warnings: string[] = [
    "Live prices are not scraped. Any dollar amounts shown are labeled EXAMPLE DATA from local fixtures.",
    "Never invent coupon codes. Open official promo pages or aggregators, then verify at checkout.",
  ];

  if (!query) {
    return { query, category, zip: ctx.zip, budget: ctx.budget, options: [], recommendation: null, warnings };
  }

  const options: CompareOption[] = retailers.map((retailer) => {
    const searchUrl = buildSearchUrl(retailer.id, query);
    const fixture = findExamplePrice(retailer.id, query);
    const couponHelp = getCouponHelp(retailer.id, query, category, pasted);
    const coupon = couponHelp.codes[0];
    const score = heuristicScore(retailer.id, category, {
      membership: Boolean(retailer.membership),
      budget: ctx.budget,
      zipSensitive: retailer.zipSensitive,
      hasZip: Boolean(ctx.zip),
    });

    const reasons: string[] = [];
    if (fixture) {
      reasons.push("Example fixture price is available for this demo query.");
    } else {
      reasons.push("No fixture price — rank uses store fit for this category.");
    }
    if (retailer.membership) reasons.push(retailer.membership);
    if (retailer.zipSensitive && ctx.zip) {
      reasons.push(`ZIP ${ctx.zip} can change local stock and pickup price.`);
    }
    if (ctx.budget != null && fixture && fixture.price.amount > ctx.budget) {
      reasons.push(`Example price is over the $${ctx.budget} budget you set.`);
    }

    return {
      retailer,
      title: fixture?.title ?? `${query} at ${retailer.name}`,
      searchUrl,
      buyUrl: searchUrl,
      extraLinks: extraLinksFor(retailer.id, ctx),
      price: fixture?.price,
      membershipNote: retailer.membership,
      coupon,
      couponHelp,
      heuristicScore: score,
      reasons,
    };
  });

  const ranked = sortOptions(options);
  if (ranked.some((option) => option.price)) {
    warnings.push("At least one card shows EXAMPLE DATA prices from fixtures, not a live crawl.");
  }

  return {
    query,
    category,
    zip: ctx.zip,
    budget: ctx.budget,
    options: ranked,
    recommendation: recommend(ranked, category),
    warnings,
  };
}
