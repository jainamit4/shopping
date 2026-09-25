import { useMemo, useState } from "react";
import { CompareGrid } from "./components/CompareGrid";
import { CouponDrawer } from "./components/CouponDrawer";
import { RecommendationBanner } from "./components/RecommendationBanner";
import { SearchForm } from "./components/SearchForm";
import { compare } from "./lib/compare";
import { RETAILERS } from "./lib/retailers";
import type { Category, CompareResult, PastedCoupon, RetailerId } from "./lib/types";

const DEMO_QUERY = "Bounty paper towels";

export function App() {
  const [query, setQuery] = useState(DEMO_QUERY);
  const [category, setCategory] = useState<Category | "auto">("auto");
  const [zip, setZip] = useState("");
  const [budget, setBudget] = useState("");
  const [stores, setStores] = useState<RetailerId[]>(RETAILERS.map((retailer) => retailer.id));
  const [pasted, setPasted] = useState<PastedCoupon[]>([]);
  const [activeStore, setActiveStore] = useState<RetailerId | null>(null);
  const [result, setResult] = useState<CompareResult | null>(() =>
    compare({ query: DEMO_QUERY, category: "household" }),
  );

  const runCompare = (
    nextQuery = query,
    overrides?: { category?: Category | "auto"; zip?: string; budget?: string },
  ) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;
    const nextCategory = overrides?.category ?? category;
    const nextZip = overrides?.zip ?? zip;
    const nextBudget = overrides?.budget ?? budget;
    const next = compare(
      {
        query: trimmed,
        category: nextCategory === "auto" ? undefined : nextCategory,
        zip: nextZip.trim() || undefined,
        budget: nextBudget ? Number(nextBudget) : undefined,
        retailerIds: stores,
      },
      pasted,
    );
    setResult(next);
    setActiveStore(next.recommendation?.retailerId ?? next.options[0]?.retailer.id ?? null);
  };

  const activeOption = useMemo(
    () => result?.options.find((option) => option.retailer.id === activeStore) ?? result?.options[0],
    [result, activeStore],
  );

  return (
    <div className="page">
      <header className="mast">
        <div className="mast-brand">
          <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#1A2332" />
            <path d="M8 12h16v11a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V12z" fill="#F4EFE6" />
            <path d="M11 12V10.2A5 5 0 0 1 21 10v2" fill="none" stroke="#C45C26" strokeWidth="1.8" />
            <circle cx="16" cy="18" r="1.5" fill="#1F6B4A" />
          </svg>
          <div>
            <p className="eyebrow">Local comparison · official buy links</p>
            <h1>Aisle</h1>
          </div>
        </div>
        <p className="lede">
          Compare authentic retailer search pages, attach coupons only when you have a real code, and get a
          plain-language recommendation. Prices shown from fixtures are <strong>EXAMPLE DATA</strong> — this app does
          not scrape stores.
        </p>
      </header>

      <SearchForm
        query={query}
        category={category}
        zip={zip}
        budget={budget}
        stores={stores}
        onQuery={setQuery}
        onCategory={setCategory}
        onZip={setZip}
        onBudget={setBudget}
        onStores={setStores}
        onSubmit={() => runCompare()}
        onDemo={() => {
          setQuery(DEMO_QUERY);
          setCategory("household");
          setZip("22102");
          setBudget("25");
          runCompare(DEMO_QUERY, { category: "household", zip: "22102", budget: "25" });
        }}
      />

      {result && (
        <>
          <RecommendationBanner result={result} />
          <CompareGrid
            result={result}
            activeId={activeStore}
            onSelect={(id) => setActiveStore(id)}
          />
          {activeOption && (
            <CouponDrawer
              option={activeOption}
              category={result.category}
              pasted={pasted}
              onPaste={(row) => {
                setPasted((prev) => {
                  const next = [...prev.filter((item) => item.store !== row.store), row];
                  const refreshed = compare(
                    {
                      query: result.query,
                      category: result.category,
                      zip: result.zip,
                      budget: result.budget,
                      retailerIds: stores,
                    },
                    next,
                  );
                  setResult(refreshed);
                  return next;
                });
              }}
            />
          )}
        </>
      )}

      <footer className="colophon">
        <p>
          Deep links only. No store logins, no credential storage, no invented coupon codes. Membership clubs
          (Costco, BJ&apos;s) may require a paid card. Travel links open Google Flights or hotel search pages — dates
          and passenger counts are completed on the destination site.
        </p>
      </footer>
    </div>
  );
}
