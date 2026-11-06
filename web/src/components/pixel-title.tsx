import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";

// Original 5×7 glyphs: SVG geometry keeps title dimensions constant during motion.
const glyphs: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  ".": ["0", "0", "0", "0", "0", "1", "1"],
  "’": ["1", "1", "0", "0", "0", "0", "0"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

Object.assign(glyphs, {
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  f: ["00110", "01001", "01000", "11100", "01000", "01000", "01000"],
  a: ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
  b: ["10000", "10000", "10110", "11001", "10001", "10001", "11110"],
  c: ["00000", "00000", "01111", "10000", "10000", "10000", "01111"],
  d: ["00001", "00001", "01101", "10011", "10001", "10001", "01111"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01111"],
  h: ["10000", "10000", "10110", "11001", "10001", "10001", "10001"],
  i: ["010", "000", "110", "010", "010", "010", "111"],
  l: ["110", "010", "010", "010", "010", "010", "111"],
  m: ["00000", "00000", "11010", "10101", "10101", "10101", "10101"],
  n: ["00000", "00000", "10110", "11001", "10001", "10001", "10001"],
  o: ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
  p: ["00000", "00000", "11110", "10001", "11110", "10000", "10000"],
  r: ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  t: ["00100", "00100", "11111", "00100", "00100", "00101", "00010"],
  u: ["00000", "00000", "10001", "10001", "10001", "10011", "01101"],
  w: ["00000", "00000", "10001", "10001", "10101", "10101", "01010"],
});
export function PixelTitle({ text }: { text: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const last = useRef(0);
  let width = 0;
  const dots: { x: number; y: number }[] = [];
  for (const char of text) {
    const rows = glyphs[char] ?? glyphs[char.toUpperCase()] ?? glyphs[" "];
    rows.forEach((row, y) =>
      [...row].forEach((bit, x) => {
        if (bit === "1") dots.push({ x: width + x, y });
      }),
    );
    width += rows[0].length + 1;
  }
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      el.classList.add("pixels-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("pixels-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const ripple = (e: PointerEvent<SVGSVGElement>) => {
    if (
      e.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      performance.now() - last.current < 65
    )
      return;
    last.current = performance.now();
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * (width + 3) - 2;
    const y = ((e.clientY - box.top) / box.height) * 11 - 2;
    e.currentTarget.querySelectorAll<SVGRectElement>("rect").forEach((dot) => {
      const dx = Number(dot.dataset.x) - x,
        dy = Number(dot.dataset.y) - y;
      const distance = Math.hypot(dx, dy);
      if (distance < 5 && dot.getAnimations().length === 0) {
        dot.animate(
          [
            { transform: "translate(0,0)", fill: "var(--foreground)" },
            {
              transform: `translate(${dx * 0.45}px,${dy * 0.65 - 1}px)`,
              fill: "var(--primary)",
              offset: 0.3,
            },
            { transform: "translate(0,0)", fill: "var(--foreground)" },
          ],
          { duration: 850, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
      }
    });
  };
  return (
    <>
      <span className="sr-only">{text}</span>
      <svg
        ref={svg}
        className="pixel-title"
        viewBox={`-2 -2 ${width + 3} 11`}
        style={{ aspectRatio: `${width + 3}/11` }}
        aria-hidden="true"
        onPointerMove={ripple}
      >
        {dots.map(({ x, y }, i) => (
          <rect
            key={i}
            data-x={x}
            data-y={y}
            x={x + 0.08}
            y={y + 0.08}
            width=".82"
            height=".82"
            rx=".12"
            style={
              {
                "--scatter-x": `${(((i * 17) % 23) - 11) * 1.1}px`,
                "--scatter-y": `${-8 - ((i * 13) % 17)}px`,
                "--pixel-delay": `${(x / (width || 1)) * 330 + (i % 7) * 24}ms`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </>
  );
}
export function PixelIcon({ index }: { index: number }) {
  const shapes = [
    ["00100", "00100", "11111", "00100", "00100"],
    ["01110", "11011", "10101", "11011", "01110"],
    ["01010", "10001", "10001", "10001", "01010"],
    ["11111", "10001", "10101", "11111", "10000"],
    ["01110", "01010", "01010", "01010", "01110"],
    ["00100", "01110", "10101", "00100", "01010"],
  ];
  return (
    <svg viewBox="0 0 7 7" width="24" height="24" aria-hidden="true">
      {shapes[index % 6].flatMap((r, y) =>
        [...r].map((v, x) =>
          v === "1" ? (
            <rect
              key={`${x}-${y}`}
              x={x + 1.1}
              y={y + 1.1}
              width=".75"
              height=".75"
              rx=".1"
              fill="currentColor"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
