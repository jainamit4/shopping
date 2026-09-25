import { useEffect, useState } from "react";
import { evaluateCoupon } from "../lib/coupons";
import type { Category, CompareOption, PastedCoupon, RetailerId } from "../lib/types";

interface Props {
  option: CompareOption;
  category: Category;
  pasted: PastedCoupon[];
  onPaste: (row: PastedCoupon) => void;
}

export function CouponDrawer({ option, category, pasted, onPaste }: Props) {
  const existing = pasted.find((row) => row.store === option.retailer.id);
  const [code, setCode] = useState(existing?.code ?? "");
  const [sourceUrl, setSourceUrl] = useState(existing?.sourceUrl ?? "");
  const [expiry, setExpiry] = useState(existing?.expiry ?? "");

  useEffect(() => {
    const row = pasted.find((item) => item.store === option.retailer.id);
    setCode(row?.code ?? "");
    setSourceUrl(row?.sourceUrl ?? "");
    setExpiry(row?.expiry ?? "");
  }, [option.retailer.id, pasted]);
  const shown = option.coupon;
  const checklist = evaluateCoupon(shown, category);

  return (
    <section className="panel coupon">
      <div className="coupon-head">
        <h2>Coupon helper · {option.retailer.name}</h2>
        <p>
          Official promo page and well-known aggregator searches only. Codes appear when a fixture example matches or
          when you paste a code you actually found. This app will not invent codes.
        </p>
      </div>

      <div className="coupon-grid">
        <div>
          <h3>Official + aggregators</h3>
          <ul className="link-list">
            <li>
              <a href={option.couponHelp.officialPromo.url} target="_blank" rel="noopener noreferrer">
                {option.couponHelp.officialPromo.label}
              </a>
              <span className="muted"> official</span>
            </li>
            {option.couponHelp.aggregators.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
                <span className="muted"> verify before checkout</span>
              </li>
            ))}
          </ul>

          <form
            className="paste"
            onSubmit={(event) => {
              event.preventDefault();
              if (!code.trim()) return;
              onPaste({
                store: option.retailer.id as RetailerId,
                code: code.trim(),
                sourceUrl: sourceUrl.trim(),
                expiry: expiry.trim() || undefined,
              });
            }}
          >
            <h3>Paste a code you found</h3>
            <label className="field">
              <span>Code</span>
              <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="only if you have one" />
            </label>
            <label className="field">
              <span>Source URL</span>
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://…"
              />
            </label>
            <label className="field">
              <span>Expiry if known</span>
              <input value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="YYYY-MM-DD" />
            </label>
            <button type="submit" className="btn ghost">
              Attach to this store
            </button>
          </form>
        </div>

        <div>
          <h3>Validation checklist</h3>
          <ul className="checks">
            {checklist.items.map((item) => (
              <li key={item.id} className={item.ok === true ? "ok" : item.ok === false ? "bad" : "na"}>
                <span className="dot" aria-hidden="true" />
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          {shown?.code ? (
            <p className="coupon-display">
              Showing <code>{shown.code}</code>
              {shown.isExample ? " · EXAMPLE DATA" : " · pasted"} ·{" "}
              <a href={shown.sourceUrl} target="_blank" rel="noopener noreferrer">
                source
              </a>
            </p>
          ) : (
            <p className="muted">{option.couponHelp.placeholders[0]?.notes}</p>
          )}
        </div>
      </div>
    </section>
  );
}
