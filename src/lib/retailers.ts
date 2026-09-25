import type { Category, Retailer, RetailerId } from "./types";

export const RETAILERS: Retailer[] = [
  {
    id: "amazon",
    name: "Amazon",
    shortName: "Amazon",
    kind: "retail",
    categories: ["groceries", "household", "clothes", "hardware", "electronics", "general"],
    officialPromoUrl: "https://www.amazon.com/coupons",
    officialPromoLabel: "Amazon Coupons",
  },
  {
    id: "walmart",
    name: "Walmart",
    shortName: "Walmart",
    kind: "retail",
    categories: ["groceries", "household", "clothes", "hardware", "electronics", "general"],
    officialPromoUrl: "https://www.walmart.com/shop/deals",
    officialPromoLabel: "Walmart Deals",
    zipSensitive: true,
  },
  {
    id: "target",
    name: "Target",
    shortName: "Target",
    kind: "retail",
    categories: ["groceries", "household", "clothes", "electronics", "general"],
    officialPromoUrl: "https://www.target.com/circle",
    officialPromoLabel: "Target Circle",
  },
  {
    id: "homedepot",
    name: "The Home Depot",
    shortName: "Home Depot",
    kind: "retail",
    categories: ["hardware", "household", "general"],
    officialPromoUrl: "https://www.homedepot.com/c/Special_Values",
    officialPromoLabel: "Home Depot Special Values",
    zipSensitive: true,
  },
  {
    id: "lowes",
    name: "Lowe's",
    shortName: "Lowe's",
    kind: "retail",
    categories: ["hardware", "household", "general"],
    officialPromoUrl: "https://www.lowes.com/l/deals",
    officialPromoLabel: "Lowe's Deals",
    zipSensitive: true,
  },
  {
    id: "costco",
    name: "Costco",
    shortName: "Costco",
    kind: "retail",
    membership: "Paid membership typically required at checkout.",
    categories: ["groceries", "household", "clothes", "hardware", "electronics", "general"],
    officialPromoUrl: "https://www.costco.com/warehouse-savings.html",
    officialPromoLabel: "Costco Warehouse Savings",
    zipSensitive: true,
  },
  {
    id: "bjs",
    name: "BJ's Wholesale Club",
    shortName: "BJ's",
    kind: "retail",
    membership: "Club membership typically required at checkout.",
    categories: ["groceries", "household", "electronics", "general"],
    officialPromoUrl: "https://www.bjs.com/category/coupon-book/349",
    officialPromoLabel: "BJ's Coupon Book",
    zipSensitive: true,
  },
  {
    id: "giant",
    name: "Giant Food",
    shortName: "Giant",
    kind: "grocery",
    categories: ["groceries", "household", "general"],
    officialPromoUrl: "https://giantfood.com/weeklyad",
    officialPromoLabel: "Giant Weekly Ad",
    zipSensitive: true,
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    shortName: "Best Buy",
    kind: "retail",
    categories: ["electronics", "general"],
    officialPromoUrl: "https://www.bestbuy.com/site/electronics/top-deals/pcmcat156500050013.c",
    officialPromoLabel: "Best Buy Top Deals",
  },
  {
    id: "google-flights",
    name: "Google Flights",
    shortName: "Flights",
    kind: "travel",
    categories: ["flights"],
    officialPromoUrl: "https://www.google.com/travel/flights",
    officialPromoLabel: "Google Flights",
  },
  {
    id: "airline-search",
    name: "Airline sites",
    shortName: "Airlines",
    kind: "travel",
    categories: ["flights"],
    officialPromoUrl: "https://www.google.com/travel/flights",
    officialPromoLabel: "Compare on Google Flights first",
  },
  {
    id: "booking",
    name: "Booking.com",
    shortName: "Booking",
    kind: "travel",
    categories: ["hotels"],
    officialPromoUrl: "https://www.booking.com/deals/index.html",
    officialPromoLabel: "Booking.com Deals",
  },
  {
    id: "hotels-com",
    name: "Hotels.com",
    shortName: "Hotels.com",
    kind: "travel",
    categories: ["hotels"],
    officialPromoUrl: "https://www.hotels.com/deals/",
    officialPromoLabel: "Hotels.com Deals",
  },
];

export const RETAILER_BY_ID: Record<RetailerId, Retailer> = Object.fromEntries(
  RETAILERS.map((retailer) => [retailer.id, retailer]),
) as Record<RetailerId, Retailer>;

export function retailersForCategory(category: Category): Retailer[] {
  return RETAILERS.filter((retailer) => retailer.categories.includes(category));
}

export function resolveRetailers(ids: RetailerId[] | undefined, category: Category): Retailer[] {
  const pool = retailersForCategory(category);
  if (!ids || ids.length === 0) return pool;
  const allowed = new Set(ids);
  const selected = pool.filter((retailer) => allowed.has(retailer.id));
  return selected.length > 0 ? selected : pool;
}
