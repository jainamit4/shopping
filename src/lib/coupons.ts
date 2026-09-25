import { aggregatorSearchLinks } from "./links";
import { RETAILER_BY_ID } from "./retailers";
import { findExampleCoupons } from "./fixtures";
import type {
  Category,
  CouponHelp,
  CouponPlaceholder,
  CouponRecord,
  PastedCoupon,
  RetailerId,
} from "./types";

export interface CouponChecklist {
  hasCode: boolean;
  hasSourceUrl: boolean;
  hasExpiry: boolean;
  categoryMatches: boolean | null;
  isExample: boolean;
  readyForDisplay: boolean;
  items: { id: string; label: string; ok: boolean | null; detail: string }[];
}

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

/**
 * Coupon helper: official promo pages + aggregator search links.
 * Codes are returned only from fixtures or a user-supplied paste — never invented.
 */
export function getCouponHelp(
  store: RetailerId,
  query: string,
  category?: Category,
  pasted?: PastedCoupon[],
): CouponHelp {
  const retailer = RETAILER_BY_ID[store];
  const fixtureCodes = findExampleCoupons(store, query, category);
  const pastedCodes = (pasted ?? [])
    .filter((row) => row.store === store && row.code.trim().length > 0)
    .map((row): CouponRecord => ({
      id: `pasted-${store}-${row.code}`,
      store,
      code: row.code.trim(),
      sourceUrl: row.sourceUrl.trim(),
      sourceLabel: row.sourceUrl.trim() ? "Pasted by you — verify before checkout" : "Pasted by you — add a source URL",
      expiry: row.expiry?.trim() || undefined,
      notes: row.notes?.trim() || "User-supplied code. This app did not generate it.",
      isExample: false,
      categoryMatch: category ? [category] : undefined,
    }));

  const codes = [...pastedCodes, ...fixtureCodes];
  const placeholders: CouponPlaceholder[] =
    codes.length === 0
      ? [
          {
            store,
            sourceUrl: retailer.officialPromoUrl,
            sourceLabel: retailer.officialPromoLabel,
            notes: "No code on file. Open the official promo page or an aggregator, then paste a code you actually found.",
            isExample: false,
          },
        ]
      : [];

  return {
    store,
    officialPromo: { label: retailer.officialPromoLabel, url: retailer.officialPromoUrl },
    aggregators: aggregatorSearchLinks(query, retailer.shortName),
    codes,
    placeholders,
  };
}

export function evaluateCoupon(
  coupon: Pick<CouponRecord, "code" | "sourceUrl" | "expiry" | "categoryMatch" | "isExample"> | undefined,
  category?: Category,
): CouponChecklist {
  const hasCode = Boolean(coupon?.code?.trim());
  const hasSourceUrl = Boolean(coupon?.sourceUrl && URL_PATTERN.test(coupon.sourceUrl));
  const hasExpiry = Boolean(coupon?.expiry?.trim());
  const categoryMatches =
    coupon?.categoryMatch && category ? coupon.categoryMatch.includes(category) : coupon?.categoryMatch ? true : null;
  const isExample = Boolean(coupon?.isExample);
  const readyForDisplay = hasCode && hasSourceUrl;

  return {
    hasCode,
    hasSourceUrl,
    hasExpiry,
    categoryMatches,
    isExample,
    readyForDisplay,
    items: [
      {
        id: "code",
        label: "Code present",
        ok: hasCode,
        detail: hasCode ? "A code was supplied (fixture or paste)." : "No code — do not invent one.",
      },
      {
        id: "source",
        label: "Source URL",
        ok: hasSourceUrl,
        detail: hasSourceUrl ? coupon!.sourceUrl : "Need an official or aggregator page you copied the code from.",
      },
      {
        id: "expiry",
        label: "Expiry known",
        ok: hasExpiry,
        detail: hasExpiry ? `Listed expiry: ${coupon!.expiry}` : "Expiry unknown — confirm on the source page.",
      },
      {
        id: "category",
        label: "Category match",
        ok: categoryMatches,
        detail:
          categoryMatches === true
            ? "Offer is tagged for this category."
            : categoryMatches === false
              ? "Offer category does not match this search."
              : "Category fit not specified.",
      },
      {
        id: "verify",
        label: "Verify before checkout",
        ok: false,
        detail: isExample
          ? "EXAMPLE DATA — this is not a live code."
          : "Always re-check the source and cart before paying.",
      },
    ],
  };
}

export function canShowCode(coupon: CouponRecord | undefined): boolean {
  return Boolean(coupon?.code?.trim());
}
