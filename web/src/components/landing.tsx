import type { View } from "./redress-workspace";
import { isAddress } from "../lib/data";
import { ShaderBackground } from "./ui/istanblue";
import { PixelTitle, PixelIcon } from "./pixel-title";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  Gamepad2,
  LayoutDashboard,
  Monitor,
  Paperclip,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
const features = [
  [
    "Detect the anomaly",
    "Observe lending-protocol liquidations without changing the protocol or its oracle.",
  ],
  [
    "Rebuild the price band",
    "Compare independent sources, reject outliers and require at least three surviving inputs.",
  ],
  [
    "Verify the verdict",
    "Use a health-factor interval to distinguish wrongful, valid, excess and ambiguous cases.",
  ],
  [
    "Compute the provable floor",
    "Calculate collateral lost minus debt relieved at the conservative edge of the band.",
  ],
  [
    "Fund the waterfall",
    "Operator bonds absorb loss first, followed by a shared reserve and an optional treasury line.",
  ],
  [
    "Publish the evidence",
    "Make per-user verdicts and evidence queryable. Arkiv and Swarm connections await deployment.",
  ],
];
const categories = [
  { name: "Lookup", Icon: Smartphone },
  { name: "Replay", Icon: Monitor },
  { name: "Monitor", Icon: LayoutDashboard },
  { name: "Vault", Icon: Gamepad2 },
];
const plans = [
  {
    name: "Operator bond",
    price: 250,
    description: "First-loss capital from the responsible oracle operator.",
    items: [
      "Illustrative capital only",
      "Adapter-specific accountability",
      "First in the payout waterfall",
    ],
    cta: "Inspect the vault",
    view: "vault" as View,
  },
  {
    name: "Shared reserve",
    price: 1000,
    description: "Pooled restitution capital with automatic payout limits.",
    items: [
      "Illustrative capital only",
      "Per-event and epoch caps",
      "Two-confirmation target",
      "No mainnet deposits",
    ],
    cta: "Explore coverage",
    view: "vault" as View,
  },
  {
    name: "Public evidence",
    price: 0,
    description: "A transparent record of verdicts, recovery and settlement.",
    items: [
      "Borrower address lookup",
      "Incident filters",
      "Downloadable evidence JSON",
      "Arkiv integration pending",
    ],
    cta: "Find a verdict",
    view: "lookup" as View,
  },
];
export function Landing({
  onConnect,
  onNavigate,
}: {
  onConnect: () => void;
  onNavigate: (view: View, address?: string) => void;
}) {
  const [category, setCategory] = useState("Replay");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("Window observer");
  const [menu, setMenu] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [notice, setNotice] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const upload = useRef<HTMLInputElement>(null);
  const modelButton = useRef<HTMLButtonElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const home = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = home.current;
    if (!root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -25px 0px" },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      el.classList.add("reveal-ready");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  const spotlight = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--pointer-y",
      `${event.clientY - rect.top}px`,
    );
  };
  const build = () => {
    if (category === "Lookup" && prompt.trim() && !isAddress(prompt.trim())) {
      setNotice(
        "Enter a complete 0x borrower wallet address, or leave it empty to open the lookup.",
      );
      textarea.current?.focus();
      return;
    }
    onNavigate(
      (
        {
          Lookup: "lookup",
          Replay: "replay",
          Monitor: "monitor",
          Vault: "vault",
        } as Record<string, View>
      )[category],
      category === "Lookup" ? prompt.trim() : undefined,
    );
  };
  return (
    <main ref={home} className="mosaic-landing">
      <div className="site-atmosphere" aria-hidden="true" />
      <section className="mosaic-hero">
        <ShaderBackground />
        <div className="wave-shade" aria-hidden="true" />
        <div className="mosaic-intro">
          <span className="release-pill">
            <span className="dot" /> Oracle errors deserve evidence, not
            guesswork. <ArrowUpRight size={12} />
          </span>
          <h1 className="editorial-title">
            When oracles fail.
            <br />
            <span>Make people whole.</span>
          </h1>
          <p>
            An evidence-based restitution layer for wrongful liquidations.
            <br className="desktop-break" /> In blocks, not weeks — the Redress
            design goal.
          </p>
        </div>
        <div className="prompt-area">
          <div className="prompt-workspace">
            <label className="sr-only" htmlFor="app-prompt">
              Borrower address (optional for replay)
            </label>
            <textarea
              ref={textarea}
              id="app-prompt"
              value={prompt}
              rows={2}
              placeholder="Enter a borrower address, or press Enter to explore the replay…"
              onChange={(e) => {
                setPrompt(e.target.value);
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 240)}px`;
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  build();
                }
              }}
            />
            <div className="category-chips" aria-label="Redress destination">
              {categories.map(({ name, Icon }) => (
                <button
                  key={name}
                  aria-pressed={category === name}
                  className={category === name ? "selected" : ""}
                  onClick={() => setCategory(name)}
                >
                  <Icon size={13} />
                  {name}
                </button>
              ))}
            </div>
            {files.length > 0 && (
              <div className="attached-files">
                {files.map((file, i) => (
                  <span key={`${file.name}-${i}`}>
                    <Paperclip size={11} />
                    {file.name}
                    <button
                      onClick={() =>
                        setFiles((f) => f.filter((_, j) => j !== i))
                      }
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="prompt-toolbar">
              <div
                className="model-control"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget))
                    setMenu(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setMenu(false);
                    modelButton.current?.focus();
                  }
                }}
              >
                <button
                  ref={modelButton}
                  className="model-trigger"
                  aria-expanded={menu}
                  aria-controls="model-options"
                  onClick={() => setMenu((v) => !v)}
                >
                  <Zap size={14} />
                  {model}
                  <ChevronDown size={12} className={menu ? "turned" : ""} />
                </button>
                {menu && (
                  <div
                    className="model-options"
                    id="model-options"
                    aria-label="Model selection"
                  >
                    {[
                      "Window observer",
                      "Guard · roadmap",
                      "Native · roadmap",
                    ].map((name, i) => (
                      <button
                        key={name}
                        aria-pressed={name === model}
                        onClick={() => {
                          setModel(name);
                          setMenu(false);
                          setNotice(
                            name === "Window observer"
                              ? "Window observer is the current demo scope."
                              : "This integration mode is roadmap only; opening a page still uses the Window demo.",
                          );
                          modelButton.current?.focus();
                        }}
                      >
                        <span>
                          {name}
                          <small>
                            {
                              [
                                "Read-only observer · MVP scope",
                                "Opt-in router · not implemented",
                                "Protocol integration · not implemented",
                              ][i]
                            }
                          </small>
                        </span>
                        {model === name && <Check size={14} />}
                      </button>
                    ))}
                    <p>Integration modes · testnet/fork scope</p>
                  </div>
                )}
              </div>
              <div className="prompt-tools">
                <input
                  ref={upload}
                  type="file"
                  multiple
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    setFiles((f) => [...f, ...picked]);
                    e.target.value = "";
                  }}
                />
                <button
                  className="attach-button"
                  aria-label="Attach local evidence notes"
                  title="Attach files locally (not uploaded)"
                  onClick={() => upload.current?.click()}
                >
                  <Paperclip size={17} />
                </button>
                <button
                  className="submit-prompt"
                  aria-label="Open Redress workspace"
                  onClick={build}
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          </div>
          <p className="prompt-help">
            <kbd>Enter</kbd> to explore <span>/</span> <kbd>Shift + Enter</kbd>{" "}
            for a new line
          </p>
          <p className="workspace-disclaimer">
            Synthetic demo · No funds sent · Notes remain local
          </p>
          {notice && (
            <div className="workspace-notice" role="status">
              {notice}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="hero-caption">
          <span className="caption-rule" />
          <span>EVIDENCE BEFORE PAYMENT. ALWAYS.</span>
          <span className="caption-rule" />
        </div>
      </section>
      <section className="mosaic-section" id="features">
        <div className="center-heading" data-reveal>
          <span className="section-kicker">
            <Sparkles size={13} /> FEATURES
          </span>
          <h2>
            <PixelTitle text="Built for redress" />
          </h2>
          <p>
            From liquidation detection to a reproducible verdict,
            <br className="desktop-break" /> with a conservative, evidence-first
            payout design.
          </p>
          <span className="concept-label">
            Architecture from the PRD · deployed integrations pending
          </span>
        </div>
        <div className="feature-grid">
          {features.map(([name, description], i) => (
            <article
              className="feature-tile"
              key={name}
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 70}ms` }}
              onPointerMove={spotlight}
            >
              <div className="feature-number">
                <span className="pixel-icon-box">
                  <PixelIcon index={i} />
                </span>
                <span className="feature-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{name}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mosaic-section pricing-section" id="pricing">
        <div className="center-heading" data-reveal>
          <span className="section-kicker">
            <Code2 size={13} /> COVERAGE
          </span>
          <h2>
            <PixelTitle text="Capital & proof" />
          </h2>
          <p>A pre-funded waterfall. A public record.</p>
          <span className="concept-label">
            Illustrative reserves · Not an insurance product
          </span>
        </div>
        <div
          className="billing-switch"
          role="group"
          aria-label="Coverage scenario"
        >
          <button
            aria-pressed={!yearly}
            className={!yearly ? "active" : ""}
            onClick={() => setYearly(false)}
          >
            Baseline
          </button>
          <button
            aria-pressed={yearly}
            className={yearly ? "active" : ""}
            onClick={() => setYearly(true)}
          >
            Stress <span>2×</span>
          </button>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              className={`plan-card ${plan.name === "Shared reserve" ? "featured" : ""}`}
              key={plan.name}
              data-reveal
              onPointerMove={spotlight}
            >
              {plan.name === "Shared reserve" && (
                <span className="popular-badge">
                  <Sparkles size={11} /> Shared backstop
                </span>
              )}
              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price">
                <span>
                  {plan.price
                    ? `${yearly ? plan.price * 2 : plan.price}`
                    : "Open"}
                </span>
                <span>{plan.price ? "WETH" : "evidence"}</span>
              </div>
              <p className="billing-caption">
                {plan.price
                  ? yearly
                    ? "Synthetic doubled-capital scenario"
                    : "Synthetic baseline capital"
                  : "No access fee or subscription"}
              </p>
              <button
                className={
                  plan.name === "Shared reserve"
                    ? "plan-cta highlighted"
                    : "plan-cta"
                }
                onClick={() => onNavigate(plan.view)}
              >
                {plan.cta}
                <ArrowUpRight size={15} />
              </button>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>
                    <Check size={13} />
                    {item}
                  </li>
                ))}
              </ul>
              <span className="plan-demo">
                Demo configuration · No deposits
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="mosaic-outro" data-reveal>
        <div className="outro-symbol" aria-hidden="true">
          ✳
        </div>
        <h2>When the price is wrong.</h2>
        <p>Trace the verdict. Inspect the evidence.</p>
        <button
          className="primary"
          onClick={() => {
            onNavigate("replay");
          }}
        >
          Explore Redress <ArrowUpRight size={16} />
        </button>
        <button className="wallet-secondary" onClick={onConnect}>
          Or connect your wallet <ArrowUpRight size={12} />
        </button>
      </section>
    </main>
  );
}
