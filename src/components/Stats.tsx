import MuxVideo from "./MuxVideo";

const stats = [
  { label: "TVL", value: "$0" },
  { label: "FnUSD Minted", value: "$0" },
  { label: "Stability Pool APY", value: "0%" },
];

const Stats = () => {
  return (
    <section id="stats" className="relative isolate overflow-hidden py-32 sm:py-40">
      <MuxVideo
        src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/50" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 sm:grid-cols-3 sm:gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
