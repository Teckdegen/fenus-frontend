import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  { n: "01", label: "DEPOSIT" },
  { n: "02", label: "MINT" },
  { n: "03", label: "LEVERAGE" },
];

const HowItWorks = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % steps.length), 2400);
    return () => clearInterval(id);
  }, []);

  const step = steps[i];

  return (
    <section id="how" className="relative bg-background py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-foreground">
          How it works
        </p>

        <div className="relative mt-12 flex h-[180px] items-center justify-center sm:h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(12px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <span className="font-display text-sm tracking-[0.4em] text-muted-foreground">
                {step.n}
              </span>
              <span className="font-display text-6xl font-semibold tracking-tight sm:text-8xl">
                {step.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {steps.map((s, idx) => (
            <span
              key={s.n}
              className={`h-px transition-all duration-500 ${
                idx === i ? "w-12 bg-foreground" : "w-6 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
