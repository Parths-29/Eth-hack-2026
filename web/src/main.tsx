import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { MotionConfig } from "motion/react";
import {
  WalletAccountPicker,
  type Account,
} from "./components/ui/wallet-account-picker";
import { RedressWorkspace, type View } from "./components/redress-workspace";
import { Landing } from "./components/landing";
import "./globals.css";
import "./polish.css";

type Provider = {
  isMetaMask?: boolean;
  providers?: Provider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};
declare global {
  interface Window {
    ethereum?: Provider;
  }
}
const short = (s: string) => `${s.slice(0, 6)}…${s.slice(-4)}`;
const demos: Account[] = [
  "71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "3a9F5c2D8e41B7a6c0E5d9f1A2b84C7e6D0f13B2",
  "B4e2a7C91d03F8e5A6b7c2D4E9f0a1B3c5D7e8F9",
  "9D1c4F6a2E8b0C3d5A7e9F1b2C4d6E8a0B3c5D7f",
].map((a, i) => ({
  address: `0x${a}`,
  name: `DEMO account ${i + 1}`,
  balance: ["2.4381", "0.9120", "128.50", "15.0007"][i],
  network: "Ethereum",
  symbol: "ETH",
  demo: true,
  avatar: i,
}));

function Brand() {
  return (
    <a href="#" className="brand" aria-label="Home">
      <span className="brand-symbol">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>
        Redress<sup>DEMO</sup>
      </span>
    </a>
  );
}
function App() {
  const allowed = [
    "landing",
    "connect",
    "replay",
    "lookup",
    "monitor",
    "incidents",
    "vault",
  ];
  const initial = location.hash.slice(1);
  const [page, setPage] = useState(
    allowed.includes(initial)
      ? initial
      : initial === "dashboard"
        ? "replay"
        : "landing",
  );
  const [lookupAddress, setLookupAddress] = useState("");
  const [accounts, setAccounts] = useState<Account[]>(demos);
  const [selected, setSelected] = useState(demos[0]);
  const [active, setActive] = useState<Account | null>(null);
  const [status, setStatus] = useState(
    "Connect MetaMask or explore clearly labelled DEMO accounts.",
  );
  const [loading, setLoading] = useState(false);
  const [spin, setSpin] = useState(0);
  const [copied, setCopied] = useState("");
  const connectRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const requestId = useRef(0);
  const navigate = (p: string) => {
    setPage(p);
    location.hash = p === "landing" ? "" : p;
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    const fn = () => {
      const value = location.hash.slice(1);
      setPage(
        allowed.includes(value)
          ? value
          : value === "dashboard"
            ? "replay"
            : "landing",
      );
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    if (page !== "connect") requestId.current++;
  }, [page]);
  useEffect(() => {
    if (page === "connect") closeRef.current?.focus();
  }, [page]);
  const close = () => {
    requestId.current++;
    setLoading(false);
    navigate("landing");
    setTimeout(() => connectRef.current?.focus(), 0);
  };
  async function connect() {
    navigate("connect");
    setLoading(true);
    setStatus("Requesting MetaMask access…");
    setAccounts([]);
    const id = ++requestId.current;
    const injected = window.ethereum;
    const provider =
      injected?.providers?.find((p) => p.isMetaMask) ??
      (injected?.isMetaMask ? injected : undefined);
    if (!provider) {
      setAccounts(demos);
      setSelected(demos[0]);
      setStatus(
        "MetaMask not detected. Explore with clearly labelled DEMO accounts.",
      );
      setLoading(false);
      return;
    }
    try {
      const addresses = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (!addresses.length) throw Error("No accounts available");
      const chain = (await provider.request({
        method: "eth_chainId",
      })) as string;
      const chains: Record<string, [string, string]> = {
        "0x1": ["Ethereum", "ETH"],
        "0x2105": ["Base", "ETH"],
        "0x89": ["Polygon", "POL"],
        "0xa": ["Optimism", "ETH"],
        "0xa4b1": ["Arbitrum", "ETH"],
        "0xaa36a7": ["Sepolia", "ETH"],
      };
      const [network, symbol] = chains[chain] ?? [
        `Chain ${parseInt(chain, 16)}`,
        "native",
      ];
      const rows = await Promise.all(
        addresses.map(async (address, i) => {
          let balance = "Unavailable";
          try {
            const hex = (await provider.request({
              method: "eth_getBalance",
              params: [address, "latest"],
            })) as string;
            const wei = BigInt(hex);
            balance = `${wei / 10n ** 18n}.${((wei % 10n ** 18n) / 10n ** 14n).toString().padStart(4, "0")}`;
          } catch {
            /* preserve real identity if balance RPC fails */
          }
          return {
            address,
            name: short(address),
            balance,
            network,
            symbol,
            demo: false,
            avatar: i % 4,
          };
        }),
      );
      if (id !== requestId.current) return;
      setAccounts(rows);
      setSelected(rows[0]);
      setStatus("MetaMask connected. Choose an account to continue.");
    } catch (e) {
      if (id !== requestId.current) return;
      const rejected = (e as { code?: number }).code === 4001;
      setAccounts(demos);
      setSelected(demos[0]);
      setStatus(
        rejected
          ? "MetaMask request rejected. No wallet connected. DEMO accounts are available."
          : "MetaMask connection unavailable. No wallet connected. DEMO accounts are available.",
      );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(selected.address);
      setCopied("Address copied");
    } catch {
      setCopied("Copy unavailable");
    }
    setTimeout(() => setCopied(""), 1800);
  }
  const openView = (view: View, address?: string) => {
    if (address) setLookupAddress(address);
    navigate(view);
  };
  const enter = () => {
    setActive(selected);
    navigate("replay");
  };
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <header className="site-header">
          <Brand />
          {page === "landing" ? (
            <nav aria-label="Main navigation">
              <a href="#features">How it works</a>
              <a href="#pricing">Coverage</a>
            </nav>
          ) : (
            <span className="mono header-note">
              REDRESS / {page.toUpperCase()}
            </span>
          )}
          <button
            ref={connectRef}
            className={
              page === "landing" ? "primary compact" : "subtle compact"
            }
            onClick={page === "landing" ? connect : () => navigate("landing")}
          >
            {page === "landing" ? "Connect wallet" : "Back to home"}
            {page === "landing" ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowLeft size={15} />
            )}
          </button>
        </header>
        {page === "landing" && (
          <Landing onConnect={connect} onNavigate={openView} />
        )}
        {page === "connect" && (
          <main
            className="connect-page"
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
          >
            <div className="connect-heading">
              <span className="eyebrow">01 / CONNECT</span>
              <h1>Choose your account.</h1>
              <p>Your address is the start. The overview comes next.</p>
            </div>
            <WalletAccountPicker
              loading={loading}
              accounts={accounts}
              selected={selected}
              spin={spin}
              copied={copied}
              status={status}
              closeRef={closeRef}
              onClose={close}
              onCopy={copy}
              onContinue={enter}
              onRetry={connect}
              onSelect={(a) => {
                setSelected(a);
                setSpin((s) => s + 1080);
                setCopied("");
              }}
            />
            <p className="connect-foot mono">
              NO SIGNATURES. NO TRANSACTIONS. JUST A VIEW.
            </p>
          </main>
        )}
        {["replay", "lookup", "monitor", "incidents", "vault"].includes(
          page,
        ) && (
          <RedressWorkspace
            key={page}
            view={page as View}
            onNavigate={openView}
            account={lookupAddress || active?.address}
          />
        )}
        <footer className="site-footer">
          <Brand />
          <span className="mono">REDRESS / TESTNET & FORK DEMO</span>
          <span>Evidence before payment.</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
