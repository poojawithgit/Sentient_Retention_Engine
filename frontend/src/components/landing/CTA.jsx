import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section id="contact" className="relative px-6 md:px-10 py-32 border-t border-faint overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] opacity-50 blur-3xl"
          style={{ background: "var(--gradient-iris)", animation: "blob-morph 14s ease-in-out infinite, spin-slow 40s linear infinite" }}
        />
      </div>

      <div className="relative text-center max-w-5xl mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">[05] — Deploy SENTIENT</div>
        <h2 className="font-display text-[9vw] md:text-[clamp(3.5rem,7.5vw,6.5rem)] leading-[0.88]">
          Stop losing <span className="italic-serif text-iris">revenue</span>.
        </h2>
        <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto">
          Plug SENTIENT into your stack in under an hour. We'll show you the churn you're preventing inside the first week — or you don't pay.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <Link
            to={localStorage.getItem('sre_token') ? "/dashboard" : "/signup"}
            data-cursor
            className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-foreground text-background font-grotesk uppercase tracking-wider hover:bg-accent transition-colors"
          >
            Start for free
            <span className="text-xl">→</span>
          </Link>
          <a
            href="#pipeline"
            data-cursor
            className="inline-flex items-center gap-4 px-10 py-5 rounded-full border border-faint font-grotesk uppercase tracking-wider hover:border-foreground transition-colors"
          >
            Read the docs
          </a>
        </div>
      </div>

      <footer className="relative mt-32 pt-10 border-t border-faint flex flex-wrap justify-between items-center gap-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <div>© 2026 Sentient Labs</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">Changelog</a>
          <a href="#" className="hover:text-foreground transition-colors">Status</a>
          <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
        <div>SOC 2 · GDPR · HIPAA</div>
      </footer>
    </section>
  );
};
