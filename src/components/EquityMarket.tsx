import { useEffect, useRef, useState } from "react";

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

/* ── canvas dot grid ──
   Draws a uniform grid of dots across the full canvas.
   Each dot twinkles independently via a sine wave offset by its position.
*/
const DotGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING = 22;   // grid cell size in px
    const DOT_R   = 1.2;  // dot radius

    let animId: number;
    let cols: number;
    let rows: number;

    // Each dot gets a random phase offset so they don't all pulse together
    let phases: Float32Array;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.ceil(canvas.width  / SPACING) + 1;
      rows = Math.ceil(canvas.height / SPACING) + 1;
      phases = new Float32Array(cols * rows);
      for (let i = 0; i < phases.length; i++) {
        phases[i] = Math.random() * Math.PI * 2;
      }
    }

    resize();
    window.addEventListener("resize", resize);

    function draw(t: number) {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      const time = t * 0.001; // seconds

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          const phase = phases[r * cols + c];
          // sine oscillates 0 → 1, each dot at its own phase + slow drift
          const alpha = 0.04 + 0.7 * Math.pow(Math.max(0, Math.sin(time * 0.9 + phase)), 3);

          ctx!.beginPath();
          ctx!.arc(x, y, DOT_R, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx!.fill();
        }
      }
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

/* ── component ── */
const EquityMarket = () => {
  const { ref, visible } = useInView(0.2);

  return (
    <section
      id="market"
      className="relative isolate overflow-hidden border-y border-border bg-background py-28 sm:py-40"
    >
      {/* uniform twinkling dot grid covering the whole section */}
      <DotGrid />

      {/* top + bottom fade so it blends into surrounding sections */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-10
                   bg-[linear-gradient(to_bottom,hsl(0_0%_0%)_0%,transparent_12%,transparent_88%,hsl(0_0%_0%)_100%)]"
      />

      {/* ── content ──
          Each text block has bg-background so it sits on top and
          punches a clean gap through the dot grid behind it.
          The text animates in line by line — writing through the dot field.
      */}
      <div
        ref={ref}
        className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-6 text-center"
      >
        {/* badge */}
        <AnimLine visible={visible} delay={0} pulseDelay={0}>
          <span className="relative inline-block rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/70 bg-background">
            Why Now
          </span>
        </AnimLine>

        {/* headline */}
        <h2 className="mt-6 font-display text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          <AnimLine visible={visible} delay={150} pulseDelay={0}>
            <span className="relative inline-block bg-background px-2">
              Trillions of Equity
            </span>
          </AnimLine>
          <AnimLine visible={visible} delay={350} pulseDelay={1.5}>
            <span className="relative inline-block bg-background px-2">
              are coming{" "}
              <span className="text-muted-foreground">on-chain.</span>
            </span>
          </AnimLine>
        </h2>

        {/* $110T */}
        <div className="mt-16 sm:mt-20">
          <AnimLine
            visible={visible}
            delay={550}
            pulseDelay={0.5}
            className="font-display text-[80px] leading-none tracking-tighter sm:text-[140px] md:text-[180px]"
          >
            <span className="relative inline-block bg-background px-4">
              $110T
            </span>
          </AnimLine>

          <AnimLine
            visible={visible}
            delay={750}
            pulseDelay={2}
            className="mt-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-muted-foreground sm:text-xs"
          >
            <span className="relative inline-block bg-background px-2">
              Global Equity Market
            </span>
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

export default EquityMarket;
