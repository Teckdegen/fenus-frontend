import MuxVideo from "./MuxVideo";

const Stats = () => {
  return (
    <section id="stats" className="relative isolate overflow-hidden py-32 sm:py-40">
      <MuxVideo
        src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/50" />
    </section>
  );
};

export default Stats;
