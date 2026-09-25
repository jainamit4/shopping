import { RETAILERS } from "../lib/retailers";
import { CATEGORIES, type Category, type RetailerId } from "../lib/types";

interface Props {
  query: string;
  category: Category | "auto";
  zip: string;
  budget: string;
  stores: RetailerId[];
  onQuery: (value: string) => void;
  onCategory: (value: Category | "auto") => void;
  onZip: (value: string) => void;
  onBudget: (value: string) => void;
  onStores: (value: RetailerId[]) => void;
  onSubmit: () => void;
  onDemo: () => void;
}

export function SearchForm({
  query,
  category,
  zip,
  budget,
  stores,
  onQuery,
  onCategory,
  onZip,
  onBudget,
  onStores,
  onSubmit,
  onDemo,
}: Props) {
  const toggle = (id: RetailerId) => {
    if (stores.includes(id)) {
      onStores(stores.filter((store) => store !== id));
    } else {
      onStores([...stores, id]);
    }
  };

  return (
    <form
      className="panel search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="search-row">
        <label className="field grow">
          <span>What are you buying?</span>
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Bounty paper towels, Ninja air fryer, BOS to SFO…"
            autoComplete="off"
            required
          />
        </label>
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(event) => onCategory(event.target.value as Category | "auto")}>
            <option value="auto">Auto-detect</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field narrow">
          <span>ZIP</span>
          <input value={zip} onChange={(event) => onZip(event.target.value)} inputMode="numeric" placeholder="22102" />
        </label>
        <label className="field narrow">
          <span>Budget $</span>
          <input
            value={budget}
            onChange={(event) => onBudget(event.target.value)}
            inputMode="decimal"
            placeholder="optional"
          />
        </label>
      </div>

      <fieldset className="stores">
        <legend>Retailers</legend>
        <div className="chips">
          {RETAILERS.map((retailer) => {
            const on = stores.includes(retailer.id);
            return (
              <label key={retailer.id} className={on ? "chip on" : "chip"}>
                <input type="checkbox" checked={on} onChange={() => toggle(retailer.id)} />
                {retailer.shortName}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="actions">
        <button type="submit" className="btn primary">
          Compare official links
        </button>
        <button type="button" className="btn ghost" onClick={onDemo}>
          Load paper-towel demo
        </button>
      </div>
    </form>
  );
}
