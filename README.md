# Aisle

A small shopping comparison app for **official retailer search links**, **coupon verification**, and a **plain-language recommendation**. It helps you jump to Amazon, Walmart, Target, Home Depot, Lowe’s, Costco, BJ’s, Giant, Best Buy, Google Flights, airline booking pages, Booking.com, and Hotels.com — then decide where to buy.

This is not a live price crawler. Any dollar amounts or coupon codes that appear without you pasting them are **EXAMPLE DATA** from local fixtures.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (Vite defaults to `http://localhost:5173`).

Production build (Vercel / GitHub Pages / any static host):

```bash
npm install
npm run build
npm run preview
```

`vite.config.ts` sets `base: "./"` so the `dist/` folder works on GitHub Pages as well as Vercel.

## Demo path

1. The home screen already loads the **Bounty paper towels** fixture.
2. Or click **Load paper-towel demo** (sets category `household`, ZIP `22102`, budget `$25`).
3. Compare cards: Walmart should rank first on the example prices; Costco/BJ’s show membership notes.
4. Select Target to see the example code `CIRCLE10` plus the validation checklist (source, expiry, category match, “verify before checkout”).
5. Try `Ninja air fryer`, `interior paint`, `BOS to SFO`, or `hotels in Chicago`.
6. Unknown queries show **Price on site** — no invented numbers.

## CLI for agents

```bash
npm run compare -- "Bounty paper towels" --category household --zip 22102
npm run compare -- "BOS to SFO"
npm run compare -- "hotels in Chicago" --stores booking,hotels-com
```

Prints JSON: store search URLs, official promo URLs, coupon aggregator search links, membership notes, optional EXAMPLE prices, and the recommendation. Agents should treat `examplePrice` and `couponCodes[].isExample === true` as demo fixtures, not live data.

Useful flags: `--category`, `--zip`, `--budget`, `--stores amazon,walmart,target`.

## Architecture

| Piece | Role |
| --- | --- |
| `src/lib/links.ts` | Deterministic deep-link builders (retail search, flights, hotels, locators). |
| `src/lib/coupons.ts` | Official promo pages + aggregator search links. Codes only from fixtures or user paste. |
| `src/lib/ranking.ts` | Lowest known example price wins; otherwise category heuristic + explanation. |
| `src/lib/compare.ts` | Search context → comparison cards + recommendation. |
| `src/lib/fixtures.ts` | Labeled EXAMPLE prices and EXAMPLE codes for demos. |
| `src/cli.ts` | Agent-facing JSON CLI (`npm run compare`). |
| `src/App.tsx` | Vite + React UI. |

### How a Shopping agent should use this

1. Call `buildSearchUrl(storeId, query)` (or the CLI) instead of guessing store URL shapes.
2. Send users to those official search/product URLs. Do not scrape behind logins.
3. For coupons, call `getCouponHelp(store, query, category)`. Show a **code only if** `codes[]` contains one (fixture or the user pasted it). Otherwise show the official promo URL and aggregator searches.
4. Always surface the checklist: source URL, expiry if known, category match, **verify before checkout**.
5. If you later add live prices (official APIs or a user-driven browser session), keep fixture rows tagged `isExample: true` and never mix them with unlabeled live numbers.

Covered link builders: **Amazon, Walmart, Target, Home Depot, Lowe’s, Costco, BJ’s, Giant, Best Buy, Google Flights, airline booking entry pages, Booking.com, Hotels.com**.

## Honest limits

- Store terms of service generally forbid aggressive scraping. This repo does not crawl carts or invent inventory.
- Live prices, tax, shipping, and membership checkout rules need the retailer’s site, an official API, or an explicit user-controlled browser session.
- Coupon aggregators are starting points. Codes expire, are region-locked, or are fake. The UI refuses to fabricate codes.
- Giant, warehouse clubs, and home-improvement pickup prices depend on ZIP/store. Locator links are provided when a ZIP is set.
- Flight and hotel links prefill a search. Dates, rooms, and passengers are completed on the destination site.
- “Giant” here is Giant Food (Ahold, mid-Atlantic). Other banners use different domains.

## Tests

```bash
npm test
```

## License

MIT
