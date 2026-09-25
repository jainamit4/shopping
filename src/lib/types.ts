export const CATEGORIES = [
  "groceries",
  "household",
  "clothes",
  "hardware",
  "electronics",
  "hotels",
  "flights",
  "general",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const RETAILER_IDS = [
  "amazon",
  "walmart",
  "target",
  "homedepot",
  "lowes",
  "costco",
  "bjs",
  "giant",
  "bestbuy",
  "google-flights",
  "airline-search",
  "booking",
  "hotels-com",
] as const;

export type RetailerId = (typeof RETAILER_IDS)[number];

export type RetailerKind = "retail" | "grocery" | "travel";

export interface SearchContext {
  query: string;
  category?: Category;
  zip?: string;
  budget?: number;
  retailerIds?: RetailerId[];
}

export interface Retailer {
  id: RetailerId;
  name: string;
  kind: RetailerKind;
  shortName: string;
  membership?: string;
  categories: Category[];
  officialPromoUrl: string;
  officialPromoLabel: string;
  zipSensitive?: boolean;
}

export interface CouponRecord {
  id: string;
  store: RetailerId;
  /** Only present when a real or fixture-supplied code exists. Never invented. */
  code?: string;
  sourceUrl: string;
  sourceLabel: string;
  expiry?: string;
  categoryMatch?: Category[];
  queryMatch?: string[];
  notes: string;
  isExample: boolean;
}

export interface CouponPlaceholder {
  store: RetailerId;
  code?: undefined;
  sourceUrl: string;
  sourceLabel: string;
  notes: string;
  isExample: false;
}

export interface AggregatorLink {
  label: string;
  url: string;
}

export interface CouponHelp {
  store: RetailerId;
  officialPromo: { label: string; url: string };
  aggregators: AggregatorLink[];
  codes: CouponRecord[];
  placeholders: CouponPlaceholder[];
}

export interface ExamplePrice {
  amount: number;
  currency: "USD";
  unit?: string;
  isExample: true;
}

export interface CompareOption {
  retailer: Retailer;
  title: string;
  searchUrl: string;
  buyUrl: string;
  extraLinks: { label: string; url: string }[];
  price?: ExamplePrice;
  membershipNote?: string;
  coupon?: CouponRecord;
  couponHelp: CouponHelp;
  heuristicScore: number;
  reasons: string[];
}

export interface Recommendation {
  retailerId: RetailerId;
  headline: string;
  explanation: string;
  usedExamplePrices: boolean;
}

export interface CompareResult {
  query: string;
  category: Category;
  zip?: string;
  budget?: number;
  options: CompareOption[];
  recommendation: Recommendation | null;
  warnings: string[];
}

export interface PastedCoupon {
  store: RetailerId;
  code: string;
  sourceUrl: string;
  expiry?: string;
  notes?: string;
}
