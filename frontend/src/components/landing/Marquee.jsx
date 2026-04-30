export const Marquee = () => {
  const items = ["Predict", "★", "Intervene", "★", "Escalate", "★", "Recover", "★", "Autonomous", "★", "Real-time", "★"];
  const row = [...items, ...items, ...items];
  return (
    <section className="relative py-10 border-y border-faint overflow-hidden">
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 35s linear infinite" }}>
        {row.map((w, i) => (
          <span key={i} className={`font-display text-[12vw] md:text-[8vw] leading-none px-8 ${w === "★" ? "italic-serif text-iris" : ""}`}>
            {w}
          </span>
        ))}
      </div>
    </section>
  );
};
