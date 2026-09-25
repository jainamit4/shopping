import { describe, expect, it } from "vitest";
import {
  buildAirlineSearchLinks,
  buildAmazonSearchUrl,
  buildBestBuySearchUrl,
  buildBjsSearchUrl,
  buildBookingSearchUrl,
  buildCostcoSearchUrl,
  buildGiantSearchUrl,
  buildGoogleFlightsUrl,
  buildHomeDepotSearchUrl,
  buildHotelsComSearchUrl,
  buildLowesSearchUrl,
  buildSearchUrl,
  buildTargetSearchUrl,
  buildWalmartSearchUrl,
  parseFlightRoute,
} from "./links";

describe("retail search link builders", () => {
  const q = "Bounty paper towels";

  it("builds Amazon, Walmart, Target, Home Depot, Costco, BJ's", () => {
    expect(buildAmazonSearchUrl(q)).toBe("https://www.amazon.com/s?k=Bounty+paper+towels");
    expect(buildWalmartSearchUrl(q)).toBe("https://www.walmart.com/search?q=Bounty+paper+towels");
    expect(buildTargetSearchUrl(q)).toBe("https://www.target.com/s?searchTerm=Bounty+paper+towels");
    expect(buildHomeDepotSearchUrl(q)).toBe("https://www.homedepot.com/s/Bounty%20paper%20towels");
    expect(buildCostcoSearchUrl(q)).toBe(
      "https://www.costco.com/CatalogSearch?dept=All&keyword=Bounty+paper+towels",
    );
    expect(buildBjsSearchUrl(q)).toBe("https://www.bjs.com/search?query=Bounty+paper+towels");
  });

  it("builds Lowe's, Giant, and Best Buy", () => {
    expect(buildLowesSearchUrl("interior paint")).toBe(
      "https://www.lowes.com/search?searchTerm=interior+paint",
    );
    expect(buildGiantSearchUrl("organic milk")).toBe(
      "https://giantfood.com/sm/pickup/rsid/3000/results?q=organic+milk",
    );
    expect(buildBestBuySearchUrl("ninja air fryer")).toBe(
      "https://www.bestbuy.com/site/searchpage.jsp?st=ninja+air+fryer",
    );
  });

  it("exposes a single dispatcher for every retailer id", () => {
    expect(buildSearchUrl("amazon", "hdmi cable")).toContain("amazon.com/s?k=");
    expect(buildSearchUrl("walmart", "hdmi cable")).toContain("walmart.com/search?q=");
    expect(buildSearchUrl("homedepot", "hdmi cable")).toContain("homedepot.com/s/");
    expect(buildSearchUrl("costco", "hdmi cable")).toContain("costco.com/CatalogSearch");
    expect(buildSearchUrl("bjs", "hdmi cable")).toContain("bjs.com/search?query=");
    expect(buildSearchUrl("target", "hdmi cable")).toContain("target.com/s?searchTerm=");
  });
});

describe("travel deep links", () => {
  it("parses airport pairs", () => {
    expect(parseFlightRoute("BOS to SFO")).toEqual({ origin: "BOS", destination: "SFO" });
    expect(parseFlightRoute("flights JFK-LAX")).toEqual({ origin: "JFK", destination: "LAX" });
  });

  it("builds Google Flights and hotel search URLs", () => {
    expect(buildGoogleFlightsUrl("BOS to SFO")).toBe(
      "https://www.google.com/travel/flights?q=Flights+from+BOS+to+SFO",
    );
    expect(buildBookingSearchUrl("hotels in Chicago")).toBe(
      "https://www.booking.com/searchresults.html?ss=Chicago",
    );
    expect(buildHotelsComSearchUrl("hotels in Chicago")).toBe(
      "https://www.hotels.com/Hotel-Search?destination=Chicago",
    );
  });

  it("includes official airline booking entry pages", () => {
    const links = buildAirlineSearchLinks("BOS to SFO");
    expect(links.some((link) => link.url.includes("aa.com"))).toBe(true);
    expect(links.some((link) => link.url.includes("delta.com"))).toBe(true);
    expect(links.some((link) => link.url.includes("united.com"))).toBe(true);
  });
});
