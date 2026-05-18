import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import blob from "../../assets/landing/blob-hero.jpg";

export const Hero = () => {
  const ref = useRef(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onMove = (e) => {
      const w = window.innerWidth, h = window.innerHeight;
      setT({ x: (e.clientX / w - 0.5) * 40, y: (e.clientY / h - 0.5) * 40 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let f = 0;
    const id = setInterval(() => {
      f += 1;
      setCount(Math.min(1284, Math.floor(f * 24)));
      if (f > 60) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between pt-32 pb-10">
      {/* Floating 3D blob */}
      <div
        className="absolute right-[5%] md:right-[10%] top-[10%] w-[50vw] max-w-[750px] aspect-square pointer-events-none"
        style={{ transform: `translate3d(${t.x}px, ${t.y}px, 0)`, transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
      >
        <div className="absolute inset-0 rounded-full blur-[120px] opacity-60"
             style={{ background: "radial-gradient(circle, hsl(320 90% 65% / 0.6), transparent 60%)" }} />
        <img src={blob} alt="SENTIENT neural retention engine visualization" className="relative w-full h-full object-contain mix-blend-screen animate-[float-slow_12s_ease-in-out_infinite]" />
      </div>

      {/* Top label */}
      <div className="relative z-10 px-6 md:px-10 flex justify-between items-start font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <div className="max-w-xs">
          <div className="text-foreground mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            [01] — Live // 19 agents active
          </div>
          An autonomous retention engine running a live neural pipeline across every customer signal.
        </div>
        <div className="text-right">
          <div className="text-foreground mb-2">v4.2 — 2026</div>
          Sentient Labs
        </div>
      </div>

      {/* Big editorial type */}
      <div className="relative z-10 px-6 md:px-10">
        <h1 className="font-display text-foreground leading-[0.88] text-[11vw] md:text-[clamp(5rem,11vw,8.8rem)] tracking-tighter">
          <span className="block overflow-hidden">
            <span className="block" style={{ animation: "char-up 1.1s cubic-bezier(0.22,1,0.36,1) both" }}>
              Predict churn
            </span>
          </span>
          <span className="block overflow-hidden">
            <span className="block italic-serif text-iris" style={{ animation: "char-up 1.1s cubic-bezier(0.22,1,0.36,1) 0.15s both" }}>
              before
            </span>
          </span>
          <span className="block overflow-hidden">
            <span className="block" style={{ animation: "char-up 1.1s cubic-bezier(0.22,1,0.36,1) 0.3s both" }}>
              it happens.
            </span>
          </span>
        </h1>
      </div>

      {/* Bottom row */}
      <div className="relative z-10 px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mt-10">
        <p className="max-w-md text-base md:text-lg text-muted-foreground leading-relaxed">
          SENTIENT runs a <span className="italic-serif text-foreground">live neural pipeline</span> across every customer signal — intervening in milliseconds, escalating intelligently, recovering revenue you didn't know you were losing.
        </p>
        <div className="flex items-center gap-4">
          <Link 
            to={(() => {
              try {
                const token = localStorage.getItem('sre_token');
                if (!token) return "/login";
                const user = JSON.parse(localStorage.getItem('sre_user') || '{}');
                return user.role === 'Admin' ? "/admin/management" : "/dashboard";
              } catch {
                return "/login";
              }
            })()} 
            data-cursor 
            className="group flex items-center gap-3 px-7 py-4 rounded-full bg-foreground text-background font-grotesk text-sm uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-background group-hover:bg-foreground transition-colors" />
            Enter the Engine
          </Link>
          <a href="#pipeline" data-cursor className="font-mono text-xs uppercase tracking-[0.2em] underline underline-offset-8 hover:text-accent transition-colors">
            Read the docs ↓
          </a>
        </div>
      </div>

      {/* Live counter strip */}
      <div className="relative z-10 mt-16 px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-y border-faint">
        {[
          { l: "Interventions today", v: count.toLocaleString() },
          { l: "Churn prevented", v: "87.3%" },
          { l: "Avg CLV saved", v: "$4,210" },
          { l: "Active agents", v: "19" },
        ].map((s) => (
          <div key={s.l} className="bg-background p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.l}</div>
            <div className="mt-2 font-display text-xl md:text-2xl">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
