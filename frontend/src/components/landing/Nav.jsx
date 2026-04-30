import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const Nav = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      const opts = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "UTC" };
      setTime(new Intl.DateTimeFormat("en-GB", opts).format(d) + " UTC");
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-6 flex items-center justify-between mix-blend-difference text-foreground">
      <Link to="/" className="font-grotesk text-xl font-bold tracking-tighter" data-cursor>
        ◐ SENTIENT<span className="italic-serif font-normal">/engine</span>
      </Link>
      <div className="hidden md:flex items-center gap-10 font-mono text-xs uppercase tracking-[0.2em]">
        <a href="#pipeline" className="hover:opacity-60 transition-opacity">Pipeline</a>
        <a href="#capabilities" className="hover:opacity-60 transition-opacity">Capabilities</a>
        <Link to="/dashboard" className="px-4 py-2 bg-iris text-white rounded-full hover:bg-iris/80 transition-all" data-cursor>Go to Dashboard</Link>
      </div>
      <div className="font-mono text-xs uppercase tracking-[0.2em] hidden sm:block tabular-nums">
        {time}
      </div>
    </nav>
  );
};
