import { downloadEvidence } from "../lib/evidence";
import { VerdictTracker } from "./features/verdict-tracker";
import { RestitutionTrackerCard } from "./ui/tracker-card-1";
import { AnimatePresence, motion } from "motion/react";
import { useSurfaceMotion } from "./ui/page-transition";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Download,
  Pause,
  Play,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
} from "lucide-react";
import type { FrontendVerdict } from "../../../shared/types";
import { evaluate, format, units, UNIT } from "../../../shared/math";
import {
  isDemo,
  isAddress,
  loadVerdicts,
  shorten,
  transactionUrl,
} from "../lib/data";
export type View = "replay" | "lookup" | "monitor" | "incidents" | "vault";
export const views: { id: View; label: string }[] = [
  { id: "replay", label: "Replay Theater" },
  { id: "lookup", label: "Was I wronged?" },
  { id: "monitor", label: "Protocol Monitor" },
  { id: "incidents", label: "Incident Explorer" },
  { id: "vault", label: "Vault & coverage" },
];
export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-border bg-card p-5 text-card-foreground ${className}`}
    >
      <h2 className="mb-4 text-[13px] font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
function Amount({
  value,
  suffix = "WETH",
}: {
  value: bigint | string;
  suffix?: string;
}) {
  return (
    <span className="font-mono tabular-nums">
      {format(value)}{" "}
      <small className="text-xs text-muted-foreground">{suffix}</small>
    </span>
  );
}
function Badge({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}
function Evidence({ record }: { record: FrontendVerdict }) {
  const [message, setMessage] = useState("");
  let result;
  try {
    result = evaluate(record.position);
  } catch {
    return (
      <p role="alert">
        Position evidence is invalid. No computed verdict is available.
      </p>
    );
  }
  const download = () => {
    downloadEvidence(record);
    setMessage("Evidence JSON downloaded");
  };
  const tx = transactionUrl(record),
    payout = transactionUrl(record, true);
  return (
    <div className="evidence-layout">
      <VerdictTracker record={record} onViewEvidence={download} />
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{record.verdict}</Badge>
          <Badge>
            {record.settlement === "simulated"
              ? "SIMULATED • NOT PAID"
              : record.settlement.toUpperCase()}
          </Badge>
          <Badge>{record.provenance.toUpperCase()}</Badge>
        </div>
        <p className="break-all font-mono text-sm">{record.user}</p>
        <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Health factor interval</dt>
            <dd className="mt-2 font-mono">
              {format(result.hfWorst)} – {format(result.hfBest)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Collateral seized</dt>
            <dd className="mt-2">
              <Amount value={record.collateralSeized} suffix="wstETH" />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Provable floor</dt>
            <dd className="mt-2 text-primary">
              <Amount value={record.redressAmount} />
            </dd>
          </div>
        </dl>
        <div className="space-y-2 border-t border-border pt-4">
          {record.sources.map((s) => (
            <div
              key={s.name}
              className="flex flex-wrap justify-between gap-2 text-xs"
            >
              <span>{s.name}</span>
              <span className="font-mono text-muted-foreground">
                {format(s.price, 5)} ETH · {s.status}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Lower-bound formula: max(0, collateral seized × band low − debt
          relieved × debt band high), converted to debt units. Excess/ambiguous
          cases deduct the allowed liquidation bonus. This browser reference is
          not an onchain attestation.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {tx ? (
            <a href={tx} target="_blank" rel="noreferrer">
              Liquidation transaction ↗
            </a>
          ) : (
            <span className="text-muted-foreground">
              Liquidation transaction: not published
            </span>
          )}
          {payout ? (
            <a href={payout} target="_blank" rel="noreferrer">
              Payout transaction ↗
            </a>
          ) : (
            <span className="text-muted-foreground">
              Payout proof: not published
            </span>
          )}
          <button className="text-link" onClick={download}>
            <Download size={13} /> Download evidence
          </button>
        </div>
        <p className="break-all text-xs text-muted-foreground">
          Evidence hash: {record.evidenceHash || "Not published"}
          <br />
          Arkiv entity: {record.arkivEntityKey || "Not published"}
        </p>
        <p className="text-xs" role="status">
          {message}
        </p>
      </div>
    </div>
  );
}
function Feed({
  records,
  onSelect,
}: {
  records: FrontendVerdict[];
  onSelect: (r: FrontendVerdict) => void;
}) {
  return records.length ? (
    <ul className="space-y-2">
      {records.map((r) => (
        <li key={r.id}>
          <button
            onClick={() => onSelect(r)}
            className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 text-left text-xs transition-colors hover:bg-muted/30"
          >
            <span>
              <span className="block font-mono">{shorten(r.user)}</span>
              <span className="mt-1 block text-muted-foreground">
                {r.protocol} ·{" "}
                {r.provenance === "synthetic" ? "Demo step" : "Block"}{" "}
                {r.blockNumber}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <Badge>{r.verdict}</Badge>
              <Amount value={r.redressAmount} />
              <ArrowRight size={13} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="py-6 text-sm text-muted-foreground">
      No records match these filters.
    </p>
  );
}
export function RedressWorkspace({
  view,
  onNavigate,
  account,
}: {
  view: View;
  onNavigate: (v: View) => void;
  account?: string;
}) {
  const surfaceMotion = useSurfaceMotion();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [records, setRecords] = useState<FrontendVerdict[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [selected, setSelected] = useState<FrontendVerdict | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSelected(null);
    loadVerdicts({}, controller.signal)
      .then((rows) => {
        setRecords(rows);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [version]);
  useEffect(() => {
    setSelected(null);
    bodyRef.current?.scrollTo(0, 0);
  }, [view]);
  useEffect(() => {
    if (selected)
      requestAnimationFrame(() =>
        document.querySelector(".verdict-details")?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        }),
      );
  }, [selected]);
  return (
    <motion.main className="dashboard" {...surfaceMotion}>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">REDRESS / WINDOW OBSERVER</span>
          <h1>{views.find((v) => v.id === view)?.label}</h1>
        </div>
        <Badge>
          {isDemo
            ? "Demo data · synthetic examples"
            : "Backend connected · verify provenance"}
        </Badge>
      </div>
      <p className="dashboard-note">
        Evidence-based restitution for oracle-driven liquidations. Testnet and
        fork scope only.{" "}
        {isDemo
          ? "No CRE watcher, Arkiv query or real payout is running."
          : "Records are supplied by the configured service; this UI does not execute payouts."}
      </p>
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Redress workspace">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setSelected(null);
              onNavigate(v.id);
            }}
            aria-current={view === v.id ? "page" : undefined}
            className={`rounded-full border px-3 py-2 text-xs ${view === v.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {v.label}
          </button>
        ))}
      </nav>
      <div
        ref={bodyRef}
        className="workspace-body"
        role="region"
        aria-label="Workspace content"
        tabIndex={0}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} className="workspace-scene" {...surfaceMotion}>
            {loading ? (
              <Panel title="Loading verdicts">
                <p role="status">
                  Reading {isDemo ? "demo fixtures" : "the verdict service"}…
                </p>
              </Panel>
            ) : error ? (
              <Panel title="Service unavailable">
                <p role="alert" className="break-words text-sm">
                  {error}
                </p>
                <button
                  className="subtle mt-4 self-start"
                  onClick={() => setVersion((v) => v + 1)}
                >
                  Retry
                </button>
              </Panel>
            ) : (
              <>
                {view === "replay" && (
                  <Replay records={records} onSelect={setSelected} />
                )}
                {view === "lookup" && (
                  <Lookup account={account} onSelect={setSelected} />
                )}
                {view === "monitor" && (
                  <Monitor initial={records} onSelect={setSelected} />
                )}
                {view === "incidents" && (
                  <Explorer records={records} onSelect={setSelected} />
                )}
                {view === "vault" && <Vault records={records} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
        {selected && (
          <div className="mt-3 verdict-details">
            <Panel title="Verdict & evidence">
              <div className="mb-4">
                <button className="text-link" onClick={() => setSelected(null)}>
                  Close details ×
                </button>
              </div>
              <Evidence key={selected.id} record={selected} />
            </Panel>
          </div>
        )}
      </div>
    </motion.main>
  );
}
function Replay({
  records,
  onSelect,
}: {
  records: FrontendVerdict[];
  onSelect: (r: FrontendVerdict) => void;
}) {
  const ordered = [...records].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  );
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1);
  const totalSteps = new Set(ordered.map((r) => r.blockNumber)).size;
  const blocks = [...new Set(ordered.map((r) => r.blockNumber))];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setStep((s) => Math.min(totalSteps, s + 1)),
      1500 / speed,
    );
    return () => clearInterval(id);
  }, [playing, speed, totalSteps]);
  useEffect(() => {
    if (step >= totalSteps) setPlaying(false);
  }, [step, totalSteps]);
  const visible = ordered.filter(
    (r) => step > 0 && r.blockNumber <= blocks[step - 1],
  );
  const total = visible.reduce((s, r) => s + BigInt(r.redressAmount), 0n);
  const current = visible.at(-1);
  const wrongful = visible.filter((r) => r.verdict === "WRONGFUL").length;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Panel
        title="gm, a clearer path to redress"
        className="sm:col-span-2 lg:col-span-2"
      >
        <p className="text-3xl tracking-tight">
          Make people whole.
          <br />
          <span className="text-primary">Evidence before payment.</span>
        </p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          10 March 2026 is the PRD’s target incident. This{" "}
          {isDemo ? "four-record constructed example" : "backend dataset"} is
          not a faithful mainnet-fork replay. Real incident verification and the
          34-account scorecard remain pending.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="subtle compact"
            aria-label="Previous replay block"
            disabled={step === 0}
            onClick={() => {
              setPlaying(false);
              setStep((s) => s - 1);
            }}
          >
            <SkipBack size={14} />
          </button>
          <button
            className="primary compact"
            disabled={!totalSteps}
            onClick={() => {
              if (step === totalSteps) setStep(0);
              setPlaying((p) => !p);
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}{" "}
            {playing ? "Pause replay" : "Play replay"}
          </button>
          <button
            className="subtle compact"
            aria-label="Next replay block"
            disabled={step === totalSteps}
            onClick={() => {
              setPlaying(false);
              setStep((s) => s + 1);
            }}
          >
            <SkipForward size={14} />
          </button>
          <button
            className="subtle compact"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            aria-label="Reset replay"
          >
            <RotateCcw size={14} />
          </button>
          <label className="flex items-center gap-2 text-xs">
            Speed
            <select
              aria-label="Replay speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="rounded-lg border border-border bg-card p-2"
            >
              {[0.5, 1, 2, 4].map((s) => (
                <option key={s} value={s}>
                  {s}×
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-5 text-xs text-muted-foreground">
          Replay position: {step} / {totalSteps}
          <input
            className="mt-3 w-full accent-primary"
            aria-label="Replay position"
            type="range"
            min="0"
            max={totalSteps || 1}
            value={step}
            disabled={!totalSteps}
            onChange={(e) => {
              setPlaying(false);
              setStep(Number(e.target.value));
            }}
          />
        </label>
      </Panel>
      <Panel title="Evidence progress">
        <p className="font-mono text-4xl">
          {visible.length}
          <span className="text-lg text-muted-foreground">
            {" "}
            / {ordered.length}
          </span>
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {wrongful} wrongful verdicts in the displayed sample. No historical
          success rate asserted.
        </p>
      </Panel>
      <Panel title="Computed floor">
        <p className="text-2xl text-primary">
          <Amount value={total} />
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Illustrative obligation, not funds sent.
        </p>
      </Panel>
      <Panel
        title="Oracle vs independent band"
        className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
      >
        <div className="flex flex-wrap gap-5 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Oracle</p>
            <p className="mt-2 font-mono text-primary">
              {current ? format(current.position.oracleCollateral, 6) : "—"} ETH
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Independent interval
            </p>
            <p className="mt-2 font-mono">
              {current
                ? `${format(current.bandLow, 5)} – ${format(current.bandHigh, 5)}`
                : "—"}{" "}
              ETH
            </p>
          </div>
        </div>
        <svg
          className="mt-8 h-56 w-full"
          viewBox="0 0 500 200"
          role="img"
          aria-label="Synthetic price band and oracle deviation"
        >
          <path d="M0 45H500V70H0Z" fill="var(--foreground)" opacity=".12" />
          <path
            d="M0 57H500"
            stroke="var(--foreground)"
            strokeDasharray="5 5"
          />
          <path
            d={`M0 57H${Math.min(step * 100, 300)}V155H500`}
            stroke="var(--primary)"
            strokeWidth="3"
            fill="none"
          />
        </svg>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Schematic, not historical price observations. Gate tolerance 75 bps;
          health-factor margin 10 bps. Payouts require independent sources and a
          provable lower bound.
        </p>
      </Panel>
      <Panel title="Current verdict">
        <p className="font-mono text-lg">
          {current?.verdict ?? "Awaiting playback"}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {current
            ? `${current.position.sourceCount} synthetic source inputs`
            : "Use Play or step through the records."}
        </p>
      </Panel>
      <Panel title="Settlement waterfall" className="lg:row-span-2">
        <p className="text-3xl text-primary">
          Bond →<br />
          Reserve →<br />
          Treasury
        </p>
        <p className="mt-5 text-xs leading-6 text-muted-foreground">
          Operator bond absorbs loss first. Treasury top-up is disabled by
          default. Two confirmations and an epoch cap are protocol requirements,
          not enforced by this browser.
        </p>
      </Panel>
      <Panel title="Replay scorecard">
        <p className="text-xs leading-6 text-muted-foreground">
          Verified incident accounts: not supplied
          <br />
          DAO baseline: 512.19 ETH (PRD reference, unverified here)
          <br />
          Classification parity: pending
          <br />
          Fork execution: not connected
          <br />
          Payout latency: not measured
        </p>
      </Panel>
      <Panel title="Execution feed" className="sm:col-span-2 lg:col-span-2">
        <Feed records={visible} onSelect={onSelect} />
      </Panel>
      <Panel
        title="Evidence & accountability"
        className="sm:col-span-2 lg:col-span-2"
      >
        <p className="mb-4 text-xs leading-6 text-muted-foreground">
          Select a feed entry to inspect the interval, inputs and reference
          calculation. Only verified full transaction hashes become explorer
          links.
        </p>
        <p className="text-xs text-muted-foreground">
          CRE · Uniswap TWAP · Arkiv · Swarm integrations await team deployment
          and verification.
        </p>
      </Panel>
    </div>
  );
}
function Lookup({
  account,
  onSelect,
}: {
  account?: string;
  onSelect: (r: FrontendVerdict) => void;
}) {
  const [address, setAddress] = useState(account ?? ""),
    [rows, setRows] = useState<FrontendVerdict[] | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    request.current?.abort();
    setRows(null);
    setError("");
    setBusy(false);
    if (!isAddress(address.trim())) {
      setError(
        "Enter a complete 0x wallet address (40 hexadecimal characters).",
      );
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    try {
      const result = await loadVerdicts(
        { user: address.trim() },
        controller.signal,
      );
      if (!controller.signal.aborted) setRows(result);
    } catch (e) {
      if (!controller.signal.aborted) setError((e as Error).message);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };
  return (
    <div className="lookup-grid">
      <Panel
        title="Was I wronged? — borrower lookup"
        className="lookup-query-panel"
      >
        <p className="mb-5 text-sm text-muted-foreground">
          Read verdicts for a borrower.{" "}
          {isDemo
            ? "Local synthetic fixtures only; this is not an Arkiv read."
            : "The configured service must query Arkiv and return the matching entities."}
        </p>
        <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="borrower">
            Borrower wallet address
          </label>
          <input
            id="borrower"
            value={address}
            onChange={(e) => {
              request.current?.abort();
              setAddress(e.target.value);
              setRows(null);
              setError("");
              setBusy(false);
            }}
            placeholder="0x…"
            className="min-w-0 flex-1 rounded-xl border border-border bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring"
          />
          <button disabled={busy} className="primary">
            <Search size={15} />
            {busy ? "Searching…" : "Check address"}
          </button>
        </form>
        {isDemo && (
          <button
            className="lookup-example"
            onClick={() => {
              request.current?.abort();
              setAddress("0x0000000000000000000000000000000000000001");
              setRows(null);
              setError("");
              setBusy(false);
            }}
          >
            Use a synthetic example address ↗
          </button>
        )}
        {error && (
          <p className="mt-4 text-sm" role="alert">
            {error}
          </p>
        )}
        {rows && (
          <div className="mt-5" role="status">
            {rows.length ? (
              <Feed records={rows} onSelect={onSelect} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No record found for this address in{" "}
                {isDemo ? "the demo dataset" : "the service response"}. This
                does not prove that no wrongful liquidation occurred.
              </p>
            )}
          </div>
        )}
        <div className="lookup-guidance">
          <span className="eyebrow">WHAT THE QUERY CHECKS</span>
          <div>
            <span>01</span>
            <p>
              <strong>Exact borrower identity</strong>Search for liquidation
              verdicts tied to a full wallet address.
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              <strong>Independent evidence</strong>Inspect the supplied price
              interval and position inputs.
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              <strong>Settlement provenance</strong>A computed loss is not a
              payout. Verify reported chain evidence.
            </p>
          </div>
        </div>
      </Panel>
      <aside
        className="lookup-tracker-panel"
        aria-label="Borrower verdict preview"
      >
        {rows?.[0] ? (
          <VerdictTracker
            record={rows[0]}
            onViewEvidence={() => onSelect(rows[0])}
          />
        ) : (
          <RestitutionTrackerCard
            status={
              busy
                ? "Reading evidence"
                : error
                  ? "Query needs attention"
                  : rows
                    ? "No matching verdict"
                    : "Awaiting borrower address"
            }
            userAddress={isAddress(address) ? address : "No borrower selected"}
            liquidatedAsset="wstETH / WETH"
            payoutAmountWei={undefined}
            synthetic={isDemo}
            steps={[
              {
                title: "Find borrower",
                description: busy
                  ? "Reading the current data source."
                  : rows
                    ? "No matching record. This is not proof that no wrongful liquidation occurred."
                    : "Enter an address to inspect its verdict.",
                status: busy ? "active" : error ? "error" : "pending",
              },
              {
                title: "Inspect price interval",
                description:
                  "Independent source inputs appear when a record is available.",
                status: "pending",
              },
              {
                title: "Compute provable floor",
                description: "No amount has been computed for this query yet.",
                status: "pending",
              },
              {
                title: "Verify settlement",
                description:
                  "No completed payout or chain confirmation has been observed.",
                status: "pending",
              },
            ]}
          />
        )}
      </aside>
    </div>
  );
}
function Explorer({
  records,
  onSelect,
}: {
  records: FrontendVerdict[];
  onSelect: (r: FrontendVerdict) => void;
}) {
  const [protocol, setProtocol] = useState(""),
    [verdict, setVerdict] = useState(""),
    [incident, setIncident] = useState(""),
    [minBlock, setMinBlock] = useState(""),
    [maxBlock, setMaxBlock] = useState(""),
    [minAmount, setMinAmount] = useState("");
  let amount = 0n;
  let invalid = false;
  try {
    amount = minAmount ? units(minAmount) : 0n;
  } catch {
    invalid = true;
  }
  if (
    (minBlock && !/^\d+$/.test(minBlock)) ||
    (maxBlock && !/^\d+$/.test(maxBlock)) ||
    (minBlock && maxBlock && BigInt(minBlock) > BigInt(maxBlock))
  )
    invalid = true;
  const rows = invalid
    ? []
    : records.filter(
        (r) =>
          (!protocol || r.protocol === protocol) &&
          (!verdict || r.verdict === verdict) &&
          (!incident || r.incidentId === incident) &&
          (!minBlock || BigInt(r.blockNumber) >= BigInt(minBlock)) &&
          (!maxBlock || BigInt(r.blockNumber) <= BigInt(maxBlock)) &&
          BigInt(r.redressAmount) >= amount,
      );
  return (
    <Panel title="Incident Explorer">
      <div className="mb-5 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
        {[
          [
            "Protocol",
            protocol,
            setProtocol,
            ["", ...new Set(records.map((r) => r.protocol))],
          ],
          [
            "Verdict",
            verdict,
            setVerdict,
            ["", "VALID", "WRONGFUL", "EXCESS", "AMBIGUOUS", "INCONCLUSIVE"],
          ],
          [
            "Incident",
            incident,
            setIncident,
            ["", ...new Set(records.map((r) => r.incidentId))],
          ],
        ].map(([name, value, setter, options]) => (
          <label key={name as string}>
            {name as string}
            <select
              className="mt-2 w-full rounded-xl border border-border bg-background p-3"
              value={value as string}
              onChange={(e) => (setter as (s: string) => void)(e.target.value)}
            >
              {(options as string[]).map((o) => (
                <option key={o} value={o}>
                  {o || "All"}
                </option>
              ))}
            </select>
          </label>
        ))}
        {[
          ["From block / step", minBlock, setMinBlock],
          ["Through block / step", maxBlock, setMaxBlock],
          ["Minimum redress (WETH)", minAmount, setMinAmount],
        ].map(([label, value, setter]) => (
          <label key={label as string}>
            {label as string}
            <input
              className="mt-2 w-full rounded-xl border border-border bg-background p-3"
              inputMode="decimal"
              value={value as string}
              onChange={(e) => (setter as (s: string) => void)(e.target.value)}
            />
          </label>
        ))}
      </div>
      {invalid ? (
        <p role="alert" className="text-sm">
          Enter non-negative numbers and an ordered block range.
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            {rows.length} matching records ·{" "}
            {isDemo
              ? "local filtering; Arkiv not connected"
              : "filtering the current backend result set"}
          </p>
          <Feed records={rows} onSelect={onSelect} />
        </>
      )}
    </Panel>
  );
}
function Monitor({
  initial,
  onSelect,
}: {
  initial: FrontendVerdict[];
  onSelect: (r: FrontendVerdict) => void;
}) {
  const [records, setRecords] = useState(initial),
    [error, setError] = useState(""),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (isDemo) return;
    const controller = new AbortController();
    let running = false;
    const poll = async () => {
      if (running) return;
      running = true;
      try {
        const rows = await loadVerdicts({}, controller.signal);
        if (!controller.signal.aborted) {
          setRecords(rows);
          setError("");
        }
      } catch (e) {
        if (!controller.signal.aborted) setError((e as Error).message);
      } finally {
        running = false;
      }
    };
    void poll();
    const timer = setInterval(poll, 10000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [refresh]);
  const calm = records.filter((r) => r.verdict === "VALID");
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Panel
        title={
          isDemo
            ? "Calm-day negative control · demo"
            : "Backend monitor · 10 second polling"
        }
        className="sm:col-span-2"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {isDemo
            ? "Synthetic VALID examples demonstrate zero payout behavior. No live watcher is active."
            : "Reads the configured verdict service; CRE operational status is not inferred from this connection."}
        </p>
        {error && (
          <p className="mb-4 text-sm" role="alert">
            Refresh failed: {error}. Showing the previous snapshot.
          </p>
        )}
        <Feed records={isDemo ? calm : records} onSelect={onSelect} />
        <button
          className="subtle mt-4 self-start"
          onClick={() => {
            if (isDemo) setRecords([...calm]);
            else setRefresh((v) => v + 1);
          }}
        >
          Refresh snapshot
        </button>
      </Panel>
      <Panel title="Zero-payout control">
        <p className="font-mono text-3xl">{calm.length}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          VALID records in this snapshot; not the PRD’s required 200+ real
          negative controls.
        </p>
      </Panel>
      <Panel title="Source outage">
        <p className="font-mono text-xl">INCONCLUSIVE</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Fewer than three independent source inputs means no computed payout.
          This policy is demonstrated locally.
        </p>
      </Panel>
    </div>
  );
}
function Vault({ records }: { records: FrontendVerdict[] }) {
  const [deviation, setDeviation] = useState(2.85),
    [bond, setBond] = useState("250"),
    [reserve, setReserve] = useState("1000"),
    [epoch, setEpoch] = useState("20");
  let bondWei = 0n,
    reserveWei = 0n,
    invalid = false;
  try {
    bondWei = units(bond);
    reserveWei = units(reserve);
  } catch {
    invalid = true;
  }
  const percent = Number(epoch);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100 || !epoch)
    invalid = true;
  const candidates = records
    .filter((r) => r.provenance === "synthetic")
    .map((r) => {
      const oracle =
        (BigInt(r.position.collateralLow) *
          BigInt(Math.round((100 - deviation) * 100))) /
        10000n;
      const p = { ...r.position, oracleCollateral: oracle.toString() };
      return evaluate(p);
    });
  const demand = candidates.reduce((s, r) => s + BigInt(r.amount), 0n);
  const cap =
    (reserveWei *
      BigInt(
        Math.round(
          (Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0) *
            100,
        ),
      )) /
    10000n;
  const budget = bondWei + reserveWei;
  const payable =
    demand < cap
      ? demand < budget
        ? demand
        : budget
      : cap < budget
        ? cap
        : budget;
  const fromBond = payable < bondWei ? payable : bondWei;
  const fromReserve = payable - fromBond;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Panel title="Operator bond · illustrative">
        <label className="text-xs text-muted-foreground">
          WETH
          <input
            aria-label="Operator bond WETH"
            value={bond}
            onChange={(e) => setBond(e.target.value)}
            className="mt-3 w-full rounded-xl border border-border bg-background p-3 font-mono"
            inputMode="decimal"
          />
        </label>
      </Panel>
      <Panel title="Shared reserve · illustrative">
        <label className="text-xs text-muted-foreground">
          WETH
          <input
            aria-label="Shared reserve WETH"
            value={reserve}
            onChange={(e) => setReserve(e.target.value)}
            className="mt-3 w-full rounded-xl border border-border bg-background p-3 font-mono"
            inputMode="decimal"
          />
        </label>
      </Panel>
      <Panel title="Epoch payout cap">
        <label className="text-xs text-muted-foreground">
          % of reserve
          <input
            aria-label="Epoch cap percent"
            value={epoch}
            onChange={(e) => setEpoch(e.target.value)}
            className="mt-3 w-full rounded-xl border border-border bg-background p-3 font-mono"
            inputMode="decimal"
          />
        </label>
      </Panel>
      <Panel title="Treasury top-up">
        <p className="font-mono text-xl">Disabled</p>
        <p className="mt-3 text-xs text-muted-foreground">
          No fund, deposit, approval or signing action is exposed.
        </p>
      </Panel>
      <Panel
        title="Oracle deviation stress simulator"
        className="sm:col-span-2 lg:col-span-4"
      >
        <label className="flex flex-col gap-4 text-sm">
          Synthetic downward oracle deviation{" "}
          <span className="font-mono text-primary">
            {deviation.toFixed(2)}%
          </span>
          <input
            aria-label="Oracle deviation percent"
            type="range"
            min="0"
            max="10"
            step="0.05"
            value={deviation}
            onChange={(e) => setDeviation(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </label>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Runs the reference verdict function on the current synthetic
          positions. It is not a statistical projection or live vault solvency
          check. The reserve-based epoch cap applies to the total simulated
          payout, before the bond → reserve waterfall.
        </p>
      </Panel>
      {invalid ? (
        <p role="alert">
          Enter valid non-negative capital amounts and a cap between 0 and 100%.
        </p>
      ) : (
        <>
          <Panel title="Computed obligation">
            <p className="text-xl">
              <Amount value={demand} />
            </p>
          </Panel>
          <Panel title="Payable within caps">
            <p className="text-xl text-primary">
              <Amount value={payable} />
            </p>
          </Panel>
          <Panel title="Waterfall allocation">
            <p className="text-xs leading-7">
              Bond: <Amount value={fromBond} />
              <br />
              Reserve: <Amount value={fromReserve} />
            </p>
          </Panel>
          <Panel title="Queued obligation">
            <p className="text-xl">
              <Amount value={demand - payable} />
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
