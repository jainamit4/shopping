#!/usr/bin/env node
import { compare } from "./lib/compare";
import { getCouponHelp } from "./lib/coupons";
import { aggregatorSearchLinks, buildSearchUrl, extraLinksFor } from "./lib/links";
import { RETAILER_BY_ID, RETAILERS } from "./lib/retailers";
import { isCategory } from "./lib/compare";
import type { Category, RetailerId, SearchContext } from "./lib/types";
import { RETAILER_IDS } from "./lib/types";

function printHelp(): void {
  console.log(`Usage: npm run compare -- "<query>" [options]

Options:
  --category <name>   groceries | household | clothes | hardware | electronics | hotels | flights | general
  --zip <zip>         optional ZIP for store-locator links
  --budget <number>   optional budget in USD
  --stores <ids>      comma-separated retailer ids (amazon,walmart,target,...)
  --json              print JSON (default)
  --help              show this help

Examples:
  npm run compare -- "Bounty paper towels" --category household --zip 22102
  npm run compare -- "BOS to SFO"
  npm run compare -- "hotels in Chicago"
`);
}

function parseArgs(argv: string[]): SearchContext & { help?: boolean } {
  const args = [...argv];
  const ctx: SearchContext = { query: "" };
  while (args.length > 0) {
    const token = args.shift() as string;
    if (token === "--help" || token === "-h") return { query: "", help: true };
    if (token === "--json") continue;
    if (token === "--category") {
      const value = args.shift();
      if (isCategory(value)) ctx.category = value as Category;
      continue;
    }
    if (token === "--zip") {
      ctx.zip = args.shift();
      continue;
    }
    if (token === "--budget") {
      const raw = args.shift();
      const n = raw ? Number(raw) : NaN;
      if (!Number.isNaN(n)) ctx.budget = n;
      continue;
    }
    if (token === "--stores") {
      const raw = args.shift() ?? "";
      ctx.retailerIds = raw
        .split(",")
        .map((id) => id.trim())
        .filter((id): id is RetailerId => (RETAILER_IDS as readonly string[]).includes(id));
      continue;
    }
    if (!token.startsWith("--") && !ctx.query) {
      ctx.query = token;
      continue;
    }
    if (!token.startsWith("--")) {
      ctx.query = ctx.query ? `${ctx.query} ${token}` : token;
    }
  }
  return ctx;
}

function main(): void {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help || !parsed.query) {
    printHelp();
    if (!parsed.query && !parsed.help) process.exitCode = 1;
    return;
  }

  const result = compare(parsed);
  const payload = {
    query: result.query,
    category: result.category,
    zip: result.zip ?? null,
    budget: result.budget ?? null,
    warnings: result.warnings,
    recommendation: result.recommendation,
    results: result.options.map((option) => {
      const help = getCouponHelp(option.retailer.id, result.query, result.category);
      return {
        storeId: option.retailer.id,
        store: option.retailer.name,
        searchUrl: buildSearchUrl(option.retailer.id, result.query),
        buyUrl: option.buyUrl,
        extraLinks: extraLinksFor(option.retailer.id, parsed),
        officialPromoUrl: RETAILER_BY_ID[option.retailer.id].officialPromoUrl,
        couponAggregatorUrls: aggregatorSearchLinks(result.query, option.retailer.shortName),
        membership: option.membershipNote ?? null,
        couponCodes: help.codes.map((coupon) => ({
          code: coupon.code,
          sourceUrl: coupon.sourceUrl,
          expiry: coupon.expiry ?? null,
          isExample: coupon.isExample,
          notes: coupon.notes,
        })),
        examplePrice: option.price
          ? { amount: option.price.amount, currency: option.price.currency, unit: option.price.unit, note: "EXAMPLE DATA" }
          : null,
        reasons: option.reasons,
      };
    }),
    retailersKnown: RETAILERS.map((retailer) => retailer.id),
  };

  console.log(JSON.stringify(payload, null, 2));
}

main();
