import { RETAILER_BY_ID } from "../lib/retailers";
import type { CompareResult } from "../lib/types";

export function RecommendationBanner({ result }: { result: CompareResult }) {
  const rec = result.recommendation;
  if (!rec) {
    return (
      <section className="banner empty">
        <p>Enter a product or trip to see store-by-store buy links.</p>
      </section>
    );
  }
  const store = RETAILER_BY_ID[rec.retailerId];
  return (
    <section className="banner" aria-live="polite">
      <div>
        <p className="eyebrow">{rec.usedExamplePrices ? "Ranked on example prices" : "Heuristic pick"}</p>
        <h2>{rec.headline}</h2>
        <p className="explain">{rec.explanation}</p>
      </div>
      <p className="banner-meta">
        {store.name} · {result.category}
        {result.zip ? ` · ZIP ${result.zip}` : ""}
        {result.budget != null ? ` · budget $${result.budget}` : ""}
      </p>
    </section>
  );
}
