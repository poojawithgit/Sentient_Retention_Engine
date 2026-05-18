export const About = () => {
  return (
    <section id="manifesto" className="relative px-6 md:px-10 py-40 border-t border-faint overflow-hidden">
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-40 blur-[100px]"
           style={{ background: "radial-gradient(circle, hsl(270 90% 65%), transparent 70%)" }} />
      <div className="relative max-w-5xl">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">[04] — Why SENTIENT</div>
        <p className="font-display text-2xl md:text-5xl leading-[1.1]">
          Most retention tools <span className="italic-serif">react</span>. SENTIENT <span className="italic-serif text-iris">predicts</span>. A self-healing pipeline that learns every customer's heartbeat — and intervenes before a single dollar walks out the door.
        </p>
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-faint pt-10">
          {[
            { v: "87.3%", l: "Churn prevented" },
            { v: "$4.2k", l: "Avg CLV saved" },
            { v: "112ms", l: "End-to-end latency" },
            { v: "19", l: "Autonomous agents" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-4xl md:text-5xl text-iris">{s.v}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
