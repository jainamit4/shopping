import { formatUsd } from "../lib/ranking";
import type { CompareResult, RetailerId } from "../lib/types";

interface Props {
  result: CompareResult;
  activeId: RetailerId | null;
  onSelect: (id: RetailerId) => void;
}

export function CompareGrid({ result, activeId, onSelect }: Props) {
  return (
    <section className="results">
      <div className="results-head">
        <h2>Side-by-side</h2>
        <p>
          {result.options.length} official search pages for “{result.query}”. Buy opens the retailer — it is not a
          cart on this site.
        </p>
      </div>
      <div className="grid">
        {result.options.map((option, index) => {
          const recommended = result.recommendation?.retailerId === option.retailer.id;
          const selected = activeId === option.retailer.id;
          return (
            <article
              key={option.retailer.id}
              className={`card${recommended ? " rec" : ""}${selected ? " selected" : ""}`}
            >
              <button type="button" className="card-select" onClick={() => onSelect(option.retailer.id)}>
                <header>
                  <span className="rank">{index + 1}</span>
                  <div>
                    <h3>{option.retailer.name}</h3>
                    <p className="muted">{option.title}</p>
                  </div>
                </header>
                <div className="price-block">
                  {option.price ? (
                    <>
                      <p className="price">{formatUsd(option.price.amount)}</p>
                      <p className="example-tag">EXAMPLE DATA{option.price.unit ? ` · ${option.price.unit}` : ""}</p>
                    </>
                  ) : (
                    <>
                      <p className="price unknown">Price on site</p>
                      <p className="muted">No fixture for this query. Open the store to see the live price.</p>
                    </>
                  )}
                </div>
                {option.membershipNote && <p className="note">{option.membershipNote}</p>}
                <div className="coupon-line">
                  {option.coupon?.code ? (
                    <>
                      <span className="code">{option.coupon.code}</span>
                      <span className={option.coupon.isExample ? "example-tag" : "ok-tag"}>
                        {option.coupon.isExample ? "EXAMPLE CODE" : "Pasted code"}
                      </span>
                    </>
                  ) : (
                    <span className="muted">No code on file — use the coupon helper.</span>
                  )}
                </div>
              </button>
              <div className="card-actions">
                <a className="btn buy" href={option.buyUrl} target="_blank" rel="noopener noreferrer">
                  Buy on {option.retailer.shortName}
                </a>
                {option.extraLinks.map((link) => (
                  <a key={link.url} className="text-link" href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
