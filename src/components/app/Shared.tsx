import { ReactNode } from "react";

export const PageHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <div className="mb-10 max-w-3xl">
    <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-foreground">
      {eyebrow}
    </p>
    <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
      {title}
    </h1>
    {description && (
      <p className="mt-4 text-balance text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
    )}
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
    className={`rounded-2xl border border-border bg-card/40 p-6 backdrop-blur ${className}`}
  >
    {children}
  </div>
);

export const Stat = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div>
    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const Field = ({
  label,
  suffix,
  placeholder = "0.0",
}: {
  label: string;
  suffix?: string;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      {label}
    </span>
    <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-3">
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        className="flex-1 bg-transparent font-display text-lg outline-none placeholder:text-muted-foreground/50"
      />
      {suffix && (
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
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
    className={`w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 ${className}`}
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
