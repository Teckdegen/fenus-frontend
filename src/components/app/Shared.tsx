import { ReactNode } from "react";

export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-3xl border border-border bg-card/60 backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-3 px-1 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
    {children}
  </p>
);

export const Row = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) => (
  <div className="flex items-center justify-between border-b border-border/40 py-3 last:border-b-0">
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
    </div>
    <span className="font-display text-sm tabular-nums text-foreground">{value}</span>
  </div>
);

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
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {balance && (
        <button
          type="button"
          className="font-mono text-[11px] text-muted-foreground transition hover:text-foreground"
        >
          Balance: {balance}
        </button>
      )}
    </div>
    <div className="flex items-center gap-3">
      <input
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full bg-transparent font-display text-3xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/30"
      />
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5">
        <span className="h-5 w-5 rounded-full bg-gradient-to-br from-foreground/80 to-foreground/30" />
        <span className="font-display text-xs font-medium tracking-wide">{symbol}</span>
      </div>
    </div>
  </div>
);

export const PrimaryButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-full bg-foreground px-10 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const GhostButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
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
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-foreground/80 to-foreground/20 font-display text-xs font-semibold text-background">
        {symbol.slice(0, 2)}
      </span>
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
