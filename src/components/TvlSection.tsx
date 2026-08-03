import { useEffect, useRef, useState } from "react";
import { fetchTVL, fmtUsdCompact } from "@/lib/tvl";

/* ── inView hook ── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── animated line ── */
interface LineProps {
  children: React.ReactNode;
  delay?: number;
  pulseDelay?: number;
  className?: string;
  visible: boolean;
}

const AnimLine = ({ children, delay = 0, pulseDelay = 0, className = "", visible }: LineProps) => (
  <span
    className={`block transition-all duration-700 ${className}`}
    style={{
      transitionDelay: `${delay}ms`,
      opacity: visible ? undefined : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      animation: visible ? `linePulse 3s ${pulseDelay}s ease-in-out infinite` : "none",
    }}
  >
    {children}
  </span>
);

/* ── component ── */
const TvlSection = () => {
  const { ref, visible } = useInView(0.2);
  const [tvl, setTvl] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTVL()
      .then((d) => { if (alive) setTvl(d.tvl); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section
      id="tvl"
      className="relative isolate overflow-hidden border-y border-border bg-background py-28 sm:py-40"
    >
      <div
        ref={ref}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center"
      >
        {/* headline */}
        <h2 className="font-display text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          <AnimLine visible={visible} delay={0} pulseDelay={0}>
            Real assets, already
          </AnimLine>
          <AnimLine visible={visible} delay={200} pulseDelay={1.5}>
            <span className="text-muted-foreground">tokenized on-chain.</span>
          </AnimLine>
        </h2>

        {/* TVL number */}
        <div className="mt-16 sm:mt-20">
          <AnimLine
            visible={visible}
            delay={550}
            pulseDelay={0.5}
            className="font-display text-[80px] leading-none tracking-tighter sm:text-[140px] md:text-[180px]"
          >
            {tvl != null ? fmtUsdCompact(tvl) : "…"}
          </AnimLine>

          <AnimLine
            visible={visible}
            delay={750}
            pulseDelay={2}
            className="mt-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-muted-foreground sm:text-xs"
          >
            Total Value Locked
          </AnimLine>
        </div>
      </div>

      <style>{`
        @keyframes linePulse {
          0%, 100% { opacity: 1;    }
          50%       { opacity: 0.2; }
        }
      `}</style>
    </section>
  );
};

export default TvlSection;
