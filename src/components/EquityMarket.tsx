import { useEffect, useRef, useState } from "react";

/* ── tiny hook: fires once when element enters viewport ── */
function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── animated line ──
   Each line slides up + fades in, then alternates bright/dim via a
   CSS pulse animation so lines breathe opposite each other.
   "invert" = starts dim-phase first so neighbouring lines are out-of-phase
*/
interface LineProps {
  children: React.ReactNode;
  delay?: number;          // entrance delay (ms)
  pulseDelay?: number;     // pulse animation offset (s) — use 0 or half period
  className?: string;
  visible: boolean;
}

const AnimLine = ({
  children,
  delay = 0,
  pulseDelay = 0,
  className = "",
  visible,
}: LineProps) => (
  <span
    className={`block transition-all duration-700 ${className}`}
    style={{
      transitionDelay: `${delay}ms`,
      opacity: visible ? undefined : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      // once visible, hand off to the pulse keyframe
      animation: visible
        ? `linePulse 3s ${pulseDelay}s ease-in-out infinite`
        : "none",
    }}
  >
    {children}
  </span>
);

/* ── shining dots ── */
const DOT_COUNT = 70;

const dots = Array.from({ length: DOT_COUNT }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 4,
  size: 1 + Math.random() * 2.5,
}));

/* ── component ── */
const EquityMarket = () => {
  const { ref, visible } = useInView(0.2);

  return (
    <section
      id="market"
      className="relative isolate overflow-hidden border-y border-border bg-background py-28 sm:py-40"
    >
      {/* shining dots */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map((d) => (
          <span
            key={d.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${d.top}%`,
              left: `${d.left}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              animation: `twinkle ${d.duration}s ${d.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* dotted grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {/* ── content ── */}
      <div
        ref={ref}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center"
      >
        {/* badge */}
        <AnimLine visible={visible} delay={0} pulseDelay={0}>
          <span className="rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/70">
            Why Now
          </span>
        </AnimLine>

        {/* headline — each line pulses opposite phase */}
        <h2 className="mt-6 font-display text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          {/* line 1 — starts bright */}
          <AnimLine visible={visible} delay={150} pulseDelay={0}>
            Trillions of Equity
          </AnimLine>

          {/* line 2 — starts dim (half period offset = 1.5s) */}
          <AnimLine visible={visible} delay={300} pulseDelay={1.5}>
            are coming{" "}
            <span className="text-muted-foreground">on-chain.</span>
          </AnimLine>
        </h2>

        {/* $110T block */}
        <div className="mt-16 sm:mt-20">
          {/* the big number — bright phase, delayed start */}
          <AnimLine
            visible={visible}
            delay={500}
            pulseDelay={0.5}
            className="font-display text-[80px] leading-none tracking-tighter sm:text-[140px] md:text-[180px]"
          >
            $110T
          </AnimLine>

          {/* label — opposite phase to number */}
          <AnimLine
            visible={visible}
            delay={700}
            pulseDelay={2}
            className="mt-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-muted-foreground sm:text-xs"
          >
            Global Equity Market
          </AnimLine>
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.06; transform: scale(1);   }
          50%       { opacity: 1;    transform: scale(1.7); }
        }

        /* bright → dim → bright cycle for each text line */
        @keyframes linePulse {
          0%, 100% { opacity: 1;    }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </section>
  );
};

export default EquityMarket;
