import type { RetailerId, SearchContext } from "./types";

const AIRLINE_HOMEPAGES = [
  { label: "American Airlines", url: "https://www.aa.com/booking/find-flights" },
  { label: "Delta", url: "https://www.delta.com/flight-search/book-a-flight" },
  { label: "United", url: "https://www.united.com/en/us/flight-search/book-a-flight" },
  { label: "Southwest", url: "https://www.southwest.com/air/booking/" },
] as const;

const AIRPORT_PAIR =
  /\b([A-Z]{3})\s*(?:to|-|→)\s*([A-Z]{3})\b/i;
const CITY_PAIR =
  /\b(?:flights?\s+)?(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s+\d|\s*$)/i;

export function encodeQuery(value: string): string {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

export function encodePath(value: string): string {
  return encodeURIComponent(value.trim());
}

export function parseFlightRoute(query: string): { origin: string; destination: string } | null {
  const airport = query.match(AIRPORT_PAIR);
  if (airport) {
    return { origin: airport[1].toUpperCase(), destination: airport[2].toUpperCase() };
  }
  const city = query.match(CITY_PAIR);
  if (city && !/hotel/i.test(query)) {
    return { origin: city[1].trim(), destination: city[2].trim() };
  }
  return null;
}

export function buildAmazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeQuery(query)}`;
}

export function buildWalmartSearchUrl(query: string): string {
  return `https://www.walmart.com/search?q=${encodeQuery(query)}`;
}

export function buildTargetSearchUrl(query: string): string {
  return `https://www.target.com/s?searchTerm=${encodeQuery(query)}`;
}

export function buildHomeDepotSearchUrl(query: string): string {
  return `https://www.homedepot.com/s/${encodePath(query)}`;
}

export function buildLowesSearchUrl(query: string): string {
  return `https://www.lowes.com/search?searchTerm=${encodeQuery(query)}`;
}

export function buildCostcoSearchUrl(query: string): string {
  return `https://www.costco.com/CatalogSearch?dept=All&keyword=${encodeQuery(query)}`;
}

export function buildBjsSearchUrl(query: string): string {
  return `https://www.bjs.com/search?query=${encodeQuery(query)}`;
}

export function buildGiantSearchUrl(query: string): string {
  return `https://giantfood.com/sm/pickup/rsid/3000/results?q=${encodeQuery(query)}`;
}

export function buildBestBuySearchUrl(query: string): string {
  return `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeQuery(query)}`;
}

export function buildGoogleFlightsUrl(query: string): string {
  const route = parseFlightRoute(query);
  const phrase = route
    ? `Flights from ${route.origin} to ${route.destination}`
    : query.trim().toLowerCase().startsWith("flight")
      ? query.trim()
      : `Flights ${query.trim()}`;
  return `https://www.google.com/travel/flights?q=${encodeQuery(phrase)}`;
}

export function buildAirlineSearchLinks(query: string): { label: string; url: string }[] {
  const route = parseFlightRoute(query);
  const hint = route ? `${route.origin} to ${route.destination}` : query.trim();
  return [
    {
      label: "Google for official airline tickets",
      url: `https://www.google.com/search?q=${encodeQuery(`${hint} official airline tickets`)}`,
    },
    ...AIRLINE_HOMEPAGES.map((airline) => ({ ...airline })),
  ];
}

export function buildBookingSearchUrl(query: string): string {
  const destination = query.replace(/\bhotels?\s+(in\s+)?/i, "").trim() || query;
  return `https://www.booking.com/searchresults.html?ss=${encodeQuery(destination)}`;
}

export function buildHotelsComSearchUrl(query: string): string {
  const destination = query.replace(/\bhotels?\s+(in\s+)?/i, "").trim() || query;
  return `https://www.hotels.com/Hotel-Search?destination=${encodeQuery(destination)}`;
}

export function buildCostcoWarehouseLocatorUrl(zip: string): string {
  return `https://www.costco.com/warehouse-locations?location=${encodeQuery(zip)}`;
}

export function buildBjsClubLocatorUrl(zip: string): string {
  return `https://www.bjs.com/club-locator?q=${encodeQuery(zip)}`;
}

export function buildHomeDepotStoreFinderUrl(zip: string): string {
  return `https://www.homedepot.com/l/search/${encodePath(zip)}`;
}

export function buildLowesStoreFinderUrl(zip: string): string {
  return `https://www.lowes.com/store/list/${encodeQuery(zip)}`;
}

export function buildGiantStoreLocatorUrl(): string {
  return "https://giantfood.com/store-locator";
}

export function buildWalmartStoreFinderUrl(zip: string): string {
  return `https://www.walmart.com/store-finder?q=${encodeQuery(zip)}`;
}

export function buildSearchUrl(retailerId: RetailerId, query: string): string {
  switch (retailerId) {
    case "amazon":
      return buildAmazonSearchUrl(query);
    case "walmart":
      return buildWalmartSearchUrl(query);
    case "target":
      return buildTargetSearchUrl(query);
    case "homedepot":
      return buildHomeDepotSearchUrl(query);
    case "lowes":
      return buildLowesSearchUrl(query);
    case "costco":
      return buildCostcoSearchUrl(query);
    case "bjs":
      return buildBjsSearchUrl(query);
    case "giant":
      return buildGiantSearchUrl(query);
    case "bestbuy":
      return buildBestBuySearchUrl(query);
    case "google-flights":
      return buildGoogleFlightsUrl(query);
    case "airline-search":
      return buildAirlineSearchLinks(query)[0].url;
    case "booking":
      return buildBookingSearchUrl(query);
    case "hotels-com":
      return buildHotelsComSearchUrl(query);
    default: {
      const _exhaustive: never = retailerId;
      return _exhaustive;
    }
  }
}

export function extraLinksFor(retailerId: RetailerId, ctx: SearchContext): { label: string; url: string }[] {
  const zip = ctx.zip?.trim();
  switch (retailerId) {
    case "airline-search":
      return buildAirlineSearchLinks(ctx.query).slice(1);
    case "costco":
      return zip ? [{ label: "Warehouse locator", url: buildCostcoWarehouseLocatorUrl(zip) }] : [];
    case "bjs":
      return zip ? [{ label: "Club locator", url: buildBjsClubLocatorUrl(zip) }] : [];
    case "homedepot":
      return zip ? [{ label: "Store finder", url: buildHomeDepotStoreFinderUrl(zip) }] : [];
    case "lowes":
      return zip ? [{ label: "Store finder", url: buildLowesStoreFinderUrl(zip) }] : [];
    case "giant":
      return [{ label: "Store locator", url: buildGiantStoreLocatorUrl() }];
    case "walmart":
      return zip ? [{ label: "Store finder", url: buildWalmartStoreFinderUrl(zip) }] : [];
    default:
      return [];
  }
}

export function aggregatorSearchLinks(query: string, storeName?: string): { label: string; url: string }[] {
  const q = storeName ? `${storeName} ${query}` : query;
  return [
    { label: "RetailMeNot", url: `https://www.retailmenot.com/s/${encodeQuery(q)}` },
    { label: "Slickdeals", url: `https://slickdeals.net/newsearch.php?q=${encodeQuery(q)}` },
    { label: "Coupons.com", url: `https://www.coupons.com/coupon-codes/search/?q=${encodeQuery(q)}` },
  ];
}
