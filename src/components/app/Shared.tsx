import { ReactNode } from "react";

// ─── Token images ─────────────────────────────────────────────────────────────
// These URLs are used everywhere tokens are displayed — inputs, pools, dashboard.
// Also used in wallet metadata so wallets like MetaMask show the correct icons.
export const WZKLITECOIN_IMAGE_URL = "https://www.image2url.com/r2/default/images/1777631633399-a83840bb-eef1-4386-8749-2007be4a5e87.jpg";
export const FNUSD_IMAGE_URL       = "https://www.image2url.com/r2/default/images/1777632157848-482b63d8-a570-4f01-bc38-94ba9ebe0722.jpg";

export const TOKEN_IMAGES: Record<string, string> = {
  zkLTC:  WZKLITECOIN_IMAGE_URL,
  WzkLTC: WZKLITECOIN_IMAGE_URL,
  FnUSD:  FNUSD_IMAGE_URL,
  USDC:   FNUSD_IMAGE_URL,
};

// Reusable token icon — real image if available, gradient fallback otherwise
export const TokenIcon = ({ symbol, className = "h-5 w-5" }: { symbol: string; className?: string }) => {
  const src = TOKEN_IMAGES[symbol];
  if (src) {
    return <img src={src} alt={symbol} className={`${className} rounded-full object-cover`} />;
  }
  return <span className={`${className} rounded-full bg-gradient-to-br from-foreground/80 to-foreground/30`} />;
};

// ─── Layout primitives ────────────────────────────────────────────────────────

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-3xl border border-border bg-card/60 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-3 px-1 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
    {children}
  </p>
);

export const Row = ({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) => (
  <div className="flex items-center justify-between border-b border-border/40 py-3 last:border-b-0">
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
    </div>
    <span className="font-display text-sm tabular-nums text-foreground">{value}</span>
  </div>
);

// ─── TokenInput ───────────────────────────────────────────────────────────────

export const TokenInput = ({
  label,
  symbol,
  balance,
  placeholder = "0.00",
  value,
  onChange,
}: {
  label: string;
  symbol: string;
  balance?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) => (
  <div className="rounded-2xl border border-border bg-background/40 p-4 transition focus-within:border-foreground/40">
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="text-[11px] text-muted-foreground shrink-0">{label}</span>
      {balance && (
        <button
          type="button"
          className="font-mono text-[11px] text-muted-foreground transition hover:text-foreground truncate max-w-[140px] text-right"
        >
          Balance: {balance}
        </button>
      )}
    </div>
    <div className="flex items-center gap-2 min-w-0">
      <input
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => {
          // Strip commas so users can paste formatted numbers like "1,000.00"
          const clean = e.target.value.replace(/,/g, "");
          onChange(clean);
        } : undefined}
        className="min-w-0 flex-1 bg-transparent font-display text-2xl sm:text-3xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/30"
      />
      {/* Token pill — fixed width so it never overflows */}
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1.5">
        <TokenIcon symbol={symbol} className="h-4 w-4 shrink-0" />
        <span className="font-display text-[11px] font-medium tracking-wide whitespace-nowrap">{symbol}</span>
      </div>
    </div>
  </div>
);

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const PrimaryButton = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-full bg-foreground px-10 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const GhostButton = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-full bg-foreground px-10 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 active:scale-[0.99] ${className}`}
  >
    {children}
  </button>
);

export const ActionPill = ({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-border bg-card/60 px-3 py-3.5 text-xs font-medium transition hover:border-foreground/40 hover:bg-foreground/5 active:scale-[0.98]"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
      <Icon className="h-4 w-4" />
    </span>
    {label}
  </button>
);

export const TokenRow = ({
  symbol,
  name,
  amount,
  value,
}: {
  symbol: string;
  name: string;
  amount: string;
  value: string;
}) => (
  <div className="flex items-center justify-between rounded-2xl px-2 py-3 transition hover:bg-foreground/[0.03]">
    <div className="flex items-center gap-3">
      <TokenIcon symbol={symbol} className="h-10 w-10" />
      <div>
        <p className="font-display text-sm font-medium">{symbol}</p>
        <p className="text-[11px] text-muted-foreground">{name}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-display text-sm tabular-nums">{amount}</p>
      <p className="text-[11px] tabular-nums text-muted-foreground">{value}</p>
    </div>
  </div>
);
