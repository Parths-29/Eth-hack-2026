import {
  useEffect,
  useId,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  Calculator,
  Coins,
  Database,
  Pause,
  Play,
  Scale,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { getDemoScenario } from "../../lib/data-service";
import { evaluate, format } from "../../../../shared/math";
const sample = getDemoScenario();
const calculation = evaluate(sample.position);
export interface RestitutionFeature {
  step: string;
  title: string;
  content: string;
  badge: string;
  icon: ElementType;
  renderVisual: () => ReactNode;
}
function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flow-visual-row">
      <span>{label}</span>
      <strong className={accent ? "accent" : ""}>{value}</strong>
    </div>
  );
}
function Visual({ index }: { index: number }) {
  return (
    <div className="flow-visual">
      <span className="flow-visual-label">
        SYNTHETIC EXAMPLE / {String(index + 1).padStart(2, "0")}
      </span>
      {index === 0 ? (
        <>
          <div className="signal-wave" aria-hidden="true">
            <svg viewBox="0 0 400 90">
              <path
                d="M0 44H65L80 38L94 51L108 40H150V78H260L280 65H400"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              <path
                d="M0 30H400"
                fill="none"
                stroke="var(--foreground)"
                strokeDasharray="4 6"
                opacity=".4"
              />
            </svg>
          </div>
          <h3>Price divergence</h3>
          <Row
            label="Protocol oracle"
            value={`${format(sample.position.oracleCollateral, 6)} ETH`}
            accent
          />
          <Row
            label="Independent low"
            value={`${format(sample.bandLow, 5)} ETH`}
          />
          <Row label="Gate tolerance" value="75 bps" />
          <p>Constructed inputs, not a live log trigger.</p>
        </>
      ) : index === 1 ? (
        <>
          <Activity className="visual-emblem" />
          <h3>Independent price band</h3>
          {sample.sources.map((s) => (
            <Row
              key={s.name}
              label={s.name}
              value={`${format(s.price, 4)} ETH`}
            />
          ))}
          <p>
            Four illustrative source inputs. CRE reads, timestamp alignment and
            consensus await integration.
          </p>
        </>
      ) : index === 2 ? (
        <>
          <Scale className="visual-emblem" />
          <h3 className="accent">{calculation.verdict}</h3>
          <Row label="HF · worst case" value={format(calculation.hfWorst)} />
          <Row label="HF · best case" value={format(calculation.hfBest)} />
          <div className="hf-band" aria-hidden="true">
            <span />
            <i />
          </div>
          <p>
            Healthy across this constructed interval. The browser reference is
            not an onchain attestation.
          </p>
        </>
      ) : index === 3 ? (
        <>
          <Calculator className="visual-emblem" />
          <h3>Provable loss floor</h3>
          <div className="flow-amount">
            {format(calculation.amount)}
            <small>WETH</small>
          </div>
          <code>max(0, C × p_cᴸ − X × p_dᴴ) / p_dᴴ</code>
          <p>Computed using exact integer arithmetic. No funds are sent.</p>
        </>
      ) : index === 4 ? (
        <>
          <Coins className="visual-emblem" />
          <h3>Settlement waterfall</h3>
          <Row label="01 / Operator bond" value="First loss" accent />
          <div className="flow-arrow">
            <ArrowRight size={15} />
          </div>
          <Row label="02 / Shared reserve" value="After bond" />
          <Row label="03 / Treasury line" value="Disabled" />
          <p>
            Design illustration only. No vault transaction or confirmations have
            been observed.
          </p>
        </>
      ) : (
        <>
          <Database className="visual-emblem" />
          <h3>Public evidence</h3>
          <Row label="Local JSON" value="Available" />
          <Row label="Arkiv entity" value="Not published" />
          <Row label="Swarm manifest" value="Not published" />
          <p>
            Inspect or download synthetic evidence in the replay. Publishing
            requires the pipeline integration.
          </p>
        </>
      )}
    </div>
  );
}
export const DEFAULT_REDRESS_STEPS: RestitutionFeature[] = [
  {
    step: "01",
    title: "Detect oracle anomaly",
    badge: "EVM log trigger",
    icon: ShieldAlert,
    content:
      "Observe LiquidationCall events and gate borrower-harmful oracle deviations against a 75 bps reference tolerance.",
    renderVisual: () => <Visual index={0} />,
  },
  {
    step: "02",
    title: "Rebuild the independent band",
    badge: "Multi-source reads",
    icon: Activity,
    content:
      "Reconstruct aligned price inputs from Uniswap TWAP, Lido and independent aggregators. Require at least three surviving sources.",
    renderVisual: () => <Visual index={1} />,
  },
  {
    step: "03",
    title: "Prove the verdict",
    badge: "Interval math",
    icon: Scale,
    content:
      "Evaluate the borrower across the band. A worst-case health factor of at least 1.001 supports a wrongful verdict.",
    renderVisual: () => <Visual index={2} />,
  },
  {
    step: "04",
    title: "Compute the provable floor",
    badge: "Exact arithmetic",
    icon: Calculator,
    content:
      "Use conservative collateral and debt prices to calculate the provable net loss, with allowed bonuses deducted for excess cases.",
    renderVisual: () => <Visual index={3} />,
  },
  {
    step: "05",
    title: "Settle the waterfall",
    badge: "Vault design",
    icon: Coins,
    content:
      "The intended CRE report settles through operator bond, shared reserve and an optional treasury line, subject to finality and caps.",
    renderVisual: () => <Visual index={4} />,
  },
  {
    step: "06",
    title: "Publish verifiable evidence",
    badge: "Arkiv + Swarm",
    icon: Database,
    content:
      "The planned pipeline publishes queryable verdicts and content-addressed evidence. Both integrations remain pending.",
    renderVisual: () => <Visual index={5} />,
  },
];
export function FeatureSteps({
  features = DEFAULT_REDRESS_STEPS,
  className = "",
  title = "Built for redress",
  autoPlayInterval = 4500,
}: {
  features?: RestitutionFeature[];
  className?: string;
  title?: string;
  autoPlayInterval?: number;
}) {
  const [current, setCurrent] = useState(0),
    [progress, setProgress] = useState(0),
    [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false),
    [inView, setInView] = useState(false),
    [visible, setVisible] = useState(document.visibilityState === "visible");
  const root = useRef<HTMLElement>(null),
    buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const reduced = useReducedMotion();
  const count = features.length;
  const selected = Math.min(current, Math.max(0, count - 1));
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (root.current) observer.observe(root.current);
    const update = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  useEffect(() => {
    if (
      reduced !== false ||
      paused ||
      hovered ||
      focused ||
      !inView ||
      !visible ||
      count < 2
    )
      return;
    const duration = Math.max(1500, autoPlayInterval),
      start = performance.now();
    setProgress(0);
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      setProgress(Math.min(100, (elapsed / duration) * 100));
      if (elapsed >= duration) {
        setCurrent((i) => (i + 1) % count);
        setProgress(0);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [
    reduced,
    paused,
    hovered,
    focused,
    inView,
    visible,
    count,
    autoPlayInterval,
    current,
  ]);
  if (!count)
    return (
      <section
        ref={root}
        id="features"
        className={`lifecycle-section ${className}`}
      >
        <h2>{title}</h2>
        <p>No lifecycle steps configured.</p>
      </section>
    );
  const choose = (index: number, focus = false) => {
    setCurrent(index);
    setProgress(0);
    if (focus) buttons.current[index]?.focus();
  };
  return (
    <section
      ref={root}
      id="features"
      className={`lifecycle-section ${className}`}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="center-heading" data-reveal>
        <span className="section-kicker">// ARCHITECTURAL LIFECYCLE</span>
        <h2>{title}</h2>
        <p>
          From liquidation detection to a reproducible verdict.
          <br />
          Evidence before payment, at every step.
        </p>
        <span className="concept-label">
          Interactive architecture demo · No live CRE execution or payout
        </span>
      </div>
      <div className="lifecycle-grid">
        <div className="lifecycle-navigation">
          <div
            role="tablist"
            aria-label="Restitution lifecycle"
            aria-orientation="vertical"
            className="lifecycle-tabs"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setHovered(true);
            }}
            onPointerLeave={() => setHovered(false)}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.step}
                  ref={(node) => {
                    buttons.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${index}`}
                  aria-selected={selected === index}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected === index ? 0 : -1}
                  className={`lifecycle-step ${selected === index ? "is-active" : ""}`}
                  onClick={() => choose(index)}
                  onKeyDown={(e) => {
                    let next: number | undefined;
                    if (e.key === "ArrowDown") next = (index + 1) % count;
                    if (e.key === "ArrowUp") next = (index - 1 + count) % count;
                    if (e.key === "Home") next = 0;
                    if (e.key === "End") next = count - 1;
                    if (next !== undefined) {
                      e.preventDefault();
                      choose(next, true);
                    }
                  }}
                >
                  <span className="lifecycle-icon">
                    <Icon size={19} />
                  </span>
                  <span className="lifecycle-copy">
                    <span className="lifecycle-step-heading">
                      <span className="lifecycle-number">{feature.step}</span>
                      <span className="lifecycle-title">{feature.title}</span>
                      <span className="lifecycle-badge">{feature.badge}</span>
                    </span>
                    <span className="lifecycle-description">
                      {feature.content}
                    </span>
                  </span>
                  {selected === index && (
                    <span
                      className="lifecycle-progress"
                      style={{ transform: `scaleX(${progress / 100})` }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="lifecycle-controls">
            <span>
              {String(selected + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")} ·{" "}
              {reduced
                ? "Manual mode"
                : paused
                  ? "Autoplay paused"
                  : hovered || focused
                    ? "Paused while exploring"
                    : "Auto-advances when visible"}
            </span>
            {!reduced && count > 1 && (
              <button
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume lifecycle" : "Pause lifecycle"}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
            )}
          </div>
        </div>
        <div
          className="lifecycle-display"
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${selected}`}
          tabIndex={0}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.22 }}
              className="lifecycle-scene"
            >
              {features[selected]?.renderVisual() ?? (
                <p>No lifecycle steps configured.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
