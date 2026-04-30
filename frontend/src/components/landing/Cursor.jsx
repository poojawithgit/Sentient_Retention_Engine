import { useEffect, useState } from "react";

export const Cursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => {
      const t = e.target;
      setHover(!!t.closest("a,button,[data-cursor]"));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <>
      <div
        className="fixed pointer-events-none z-[100] mix-blend-difference transition-[width,height] duration-300 ease-out"
        style={{
          left: pos.x,
          top: pos.y,
          width: hover ? 64 : 12,
          height: hover ? 64 : 12,
          transform: "translate(-50%,-50%)",
          background: "white",
          borderRadius: "9999px",
        }}
      />
    </>
  );
};
