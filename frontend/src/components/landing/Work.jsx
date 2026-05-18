import { useEffect, useRef, useState } from "react";
import w1 from "../../assets/landing/work-1.jpg";
import w2 from "../../assets/landing/work-2.jpg";
import w3 from "../../assets/landing/work-3.jpg";
import w4 from "../../assets/landing/work-4.jpg";

const stages = [
  { title: "Signal Ingest", tags: "events · billing · product · support", latency: "8ms", img: w1, desc: "19 agents stream every customer signal into a unified feature store in real-time." },
  { title: "Churn Prediction", tags: "neural · SHAP · gradient boost", latency: "24ms", img: w2, desc: "Ensemble models score churn risk per account with feature-level explainability." },
  { title: "Live Intervention", tags: "email · in-app · webhooks", latency: "112ms", img: w3, desc: "Autonomous actions trigger the moment risk crosses threshold — no humans needed." },
  { title: "Smart Escalation", tags: "CSM · chain-of-thought · audit", latency: "1.2s", img: w4, desc: "Edge cases route to a human with a full reasoning trace and recommended save play." },
];

export const Pipeline = () => {
  return (
    <section id="pipeline" className="relative px-6 md:px-10 py-32">
      <div className="flex justify-between items-end mb-20 flex-wrap gap-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">[02] — The Pipeline</div>
          <h2 className="font-display text-4xl md:text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9]">
            Four stages, <span className="italic-serif text-iris">one</span> autonomous loop.
          </h2>
        </div>
        <a href="#capabilities" data-cursor className="font-mono text-xs uppercase tracking-[0.2em] underline underline-offset-8 hover:text-iris transition-colors" aria-label="Explore the Sentient Retention Engine architecture">
          See architecture →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-24">
        {stages.map((p, i) => (
          <StageCard key={p.title} {...p} index={i} />
        ))}
      </div>
    </section>
  );
};

const StageCard = ({ title, tags, latency, desc, img, index }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group ${index % 2 === 1 ? "md:mt-24" : ""}`}
      style={{ animation: visible ? `reveal-up 1s cubic-bezier(0.22,1,0.36,1) both` : undefined }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-card">
        <img
          src={img}
          alt={title}
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out"
          style={{ transform: hover ? "scale(1.08)" : "scale(1)" }}
        />
        <div className="absolute top-6 left-6 font-mono text-[10px] uppercase tracking-widest bg-background/60 backdrop-blur px-3 py-1.5 rounded-full">
          stage 0{index + 1}
        </div>
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ background: "linear-gradient(to top, hsl(0 0% 0% / 0.85), transparent 50%)", opacity: hover ? 1 : 0 }}
        />
        <div
          className="absolute bottom-6 left-6 right-6 transition-all duration-500"
          style={{ transform: hover ? "translateY(0)" : "translateY(20px)", opacity: hover ? 1 : 0 }}
        >
          <p className="text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-between items-baseline gap-4">
        <h3 className="font-display text-2xl md:text-3xl">{title}</h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-iris whitespace-nowrap">{latency} avg</span>
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{tags}</div>
    </div>
  );
};
