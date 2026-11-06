import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { View } from "../redress-workspace";
import { getDemoScenario } from "../../lib/data-service";
import { format } from "../../../../shared/math";
export interface TickerItem {
  id: string;
  protocol: string;
  pair: string;
  headlinePrice: string;
  delta: string;
  isGlitch: boolean;
  tag: string;
  actionLabel: string;
  view: View;
}
const sample = getDemoScenario();
const items: TickerItem[] = [
  {
    id: "aave",
    protocol: "Aave v3 Core",
    pair: "wstETH / WETH",
    headlinePrice: `${format(sample.position.oracleCollateral, 6)} ETH`,
    delta: "Synthetic oracle input",
    isGlitch: true,
    tag: "DEMO ANOMALY",
    actionLabel: "Replay example",
    view: "replay",
  },
  {
    id: "uniswap",
    protocol: "Uniswap v3 TWAP",
    pair: "wstETH / WETH",
    headlinePrice: `${format(sample.sources[1].price, 4)} ETH`,
    delta: "Illustrative source · not synced",
    isGlitch: false,
    tag: "DEMO BAND",
    actionLabel: "Inspect inputs",
    view: "incidents",
  },
  {
    id: "moonwell",
    protocol: "Moonwell Base",
    pair: "cbETH / USD",
    headlinePrice: "Data pending",
    delta: "No verified incident imported",
    isGlitch: true,
    tag: "NOT CONNECTED",
    actionLabel: "Open monitor",
    view: "monitor",
  },
  {
    id: "lido",
    protocol: "Lido fundamental rate",
    pair: "stEthPerToken",
    headlinePrice: `${format(sample.sources[0].price, 4)} ETH`,
    delta: "Synthetic reference · not a contract read",
    isGlitch: false,
    tag: "DEMO ANCHOR",
    actionLabel: "View evidence",
    view: "lookup",
  },
  {
    id: "vesu",
    protocol: "Vesu Starknet",
    pair: "Incident dataset",
    headlinePrice: "Data pending",
    delta: "No verified source configured",
    isGlitch: true,
    tag: "NOT CONNECTED",
    actionLabel: "Browse incidents",
    view: "incidents",
  },
  {
    id: "vault",
    protocol: "Redress Vault",
    pair: "Bond + reserve",
    headlinePrice: "1,250 WETH",
    delta: "Illustrative capital · not funded",
    isGlitch: false,
    tag: "DEMO RESERVE",
    actionLabel: "Check vault",
    view: "vault",
  },
];
export function TickerCarousel({
  onNavigate,
}: {
  onNavigate: (view: View) => void;
}) {
  const [paused, setPaused] = useState(false),
    [visible, setVisible] = useState(false),
    [tabVisible, setTabVisible] = useState(
      document.visibilityState === "visible",
    );
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (root.current) observer.observe(root.current);
    const update = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const render = (duplicate = false) => (
    <div
      className="ticker-group"
      aria-hidden={duplicate || undefined}
      inert={duplicate || undefined}
    >
      {items.map((item) => {
        const Icon = item.isGlitch ? AlertTriangle : ShieldCheck;
        return (
          <button
            key={item.id}
            className={`ticker-pill ${item.isGlitch ? "ticker-anomaly" : ""}`}
            onClick={() => onNavigate(item.view)}
            tabIndex={duplicate ? -1 : 0}
          >
            <span className="ticker-icon">
              <Icon size={16} />
            </span>
            <span className="ticker-copy">
              <span className="ticker-protocol">
                {item.protocol}
                <small>{item.pair}</small>
              </span>
              <span className="ticker-value">
                {item.headlinePrice}
                <small>{item.delta}</small>
              </span>
            </span>
            <span className="ticker-action">
              {item.actionLabel}
              <ArrowUpRight size={12} />
            </span>
          </button>
        );
      })}
    </div>
  );
  return (
    <section
      ref={root}
      className={`risk-ticker ${reduced ? "ticker-static" : ""}`}
      aria-label="Protocol risk examples"
    >
      <div className="ticker-heading">
        <div>
          <span className="eyebrow">PROTOCOL SIGNALS</span>
          <p>Demonstration feed · Not live data</p>
        </div>
        {!reduced && (
          <button
            className="ticker-pause"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Resume risk ticker" : "Pause risk ticker"}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        )}
      </div>
      <div className="ticker-window">
        <div
          className="ticker-track"
          style={{
            animationPlayState:
              paused || !visible || !tabVisible || reduced
                ? "paused"
                : "running",
          }}
        >
          {render()}
          {!reduced && render(true)}
        </div>
      </div>
    </section>
  );
}
