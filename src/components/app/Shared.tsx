import { ReactNode } from "react";

export const PageHeader = ({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) => (
  <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
    <div className="max-w-2xl">
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-balance text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {right}
  </div>
);

export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-border bg-card/40 backdrop-blur transition hover:border-foreground/20 ${className}`}
  >
    {children}
  </div>
);

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
    {children}
  </p>
);

export const Stat = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) => (
  <div>
    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      {label}
    </p>
    <p
      className={`mt-2 font-display tabular-nums tracking-tight ${
        accent
          ? "bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl"
          : "text-2xl font-semibold sm:text-[28px]"
      }`}
    >
      {value}
    </p>
    {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const Field = ({
  label,
  suffix,
  placeholder = "0.00",
  balance,
}: {
  label: string;
  suffix?: string;
  placeholder?: string;
  balance?: string;
}) => (
  <label className="block">
    <div className="mb-2 flex items-center justify-between">
      <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      {balance && (
        <span className="font-mono text-[10px] text-muted-foreground">
          Balance: {balance}
        </span>
      )}
    </div>
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-3.5 transition focus-within:border-foreground/40">
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        className="flex-1 bg-transparent font-display text-xl tabular-nums outline-none placeholder:text-muted-foreground/40"
      />
      {suffix && (
        <span className="rounded-full border border-border px-2.5 py-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  </label>
);

export const PrimaryButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50 ${className}`}
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
    className={`w-full rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-foreground/5 ${className}`}
  >
    {children}
  </button>
);

export const Row = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-b-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-display text-sm tabular-nums">{value}</span>
  </div>
);
