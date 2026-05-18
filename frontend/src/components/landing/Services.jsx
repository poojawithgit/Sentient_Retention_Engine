import { useState } from "react";

const services = [
  { n: "01", t: "Churn Prediction", d: "Per-account risk scores with SHAP feature importance updated every event — not nightly batches." },
  { n: "02", t: "Autonomous Intervention", d: "19 specialist agents trigger save plays in milliseconds, across email, in-app, billing and webhooks." },
  { n: "03", t: "Smart Escalation", d: "Edge cases route to your CSMs with a full chain-of-thought trace and a recommended next action." },
  { n: "04", t: "Revenue Analytics", d: "Live dashboards show CLV saved, churn prevented, and the exact attribution for every intervention." },
];

export const Services = () => {
  const [active, setActive] = useState(null);

  return (
    <section id="capabilities" className="relative px-6 md:px-10 py-32 border-t border-faint">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">[03] — Capabilities</div>
          <h2 className="font-display text-4xl md:text-6xl leading-[0.9] sticky top-32">
            One engine. <span className="italic-serif text-iris">Every</span> retention surface.
          </h2>
        </div>
        <div className="md:col-span-8 md:col-start-6">
          {services.map((s, i) => (
            <div
              key={s.n}
              data-cursor
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className="group border-t border-faint last:border-b py-8 md:py-10 grid grid-cols-12 gap-4 items-center transition-colors"
              style={{ background: active === i ? "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.03))" : "transparent" }}
            >
              <span className="col-span-2 font-mono text-xs text-muted-foreground">{s.n}</span>
              <h3 className="col-span-10 md:col-span-4 font-display text-2xl md:text-4xl transition-transform duration-500" style={{ transform: active === i ? "translateX(12px)" : "translateX(0)" }}>
                {s.t}
              </h3>
              <p className="col-start-3 md:col-start-7 col-span-10 md:col-span-6 text-sm md:text-base text-muted-foreground">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
