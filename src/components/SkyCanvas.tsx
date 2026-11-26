import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

// Sky palette stops, taken from the project's colour spec.
const STOPS = [
  { at: 0, top: "#65B9ED", bottom: "#F4F8FF" }, // sky blue -> cloud white
  { at: 0.35, top: "#6E65A5", bottom: "#FFB36A" }, // twilight -> golden orange
  { at: 0.7, top: "#183B70", bottom: "#F49BC0" }, // deep blue -> sunset pink
  { at: 1, top: "#10162F", bottom: "#183B70" }, // cosmic navy night
];

const toRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const mix = (a: string, b: string, t: number) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};

const sample = (p: number, key: "top" | "bottom") => {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (p <= b.at) return mix(a[key], b[key], (p - a.at) / (b.at - a.at));
  }
  return STOPS[STOPS.length - 1][key];
};

type Props = { progressRef: MutableRefObject<number> };

/**
 * One fixed full-screen canvas behind the whole page. It draws the sky gradient
 * (driven by scroll progress), drifting clouds, stars that appear at dusk,
 * layered mountains, floating motes, and a comet. Procedural, so no image or
 * video assets are required and it stays cheap on the GPU.
 */
export default function SkyCanvas({ progressRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 720;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const stars = Array.from({ length: isMobile ? 90 : 200 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.7,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const clouds = Array.from({ length: isMobile ? 5 : 9 }, () => ({
      x: Math.random(),
      y: 0.2 + Math.random() * 0.5,
      r: 120 + Math.random() * 180,
      speed: 0.00003 + Math.random() * 0.00007,
      depth: 0.3 + Math.random() * 0.7,
    }));

    const motes = Array.from({ length: isMobile ? 20 : 45 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.6,
      drift: 0.00002 + Math.random() * 0.00005,
    }));

    const mouse = { x: 0, y: 0 };
    let comet: { t: number } | null = null;
    let nextAutoComet = performance.now() + 9000;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / w - 0.5;
      mouse.y = e.clientY / h - 0.5;
    };
    const onComet = () => {
      comet = { t: 0 };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("portfolio:comet", onComet);

    let raf = 0;
    let last = performance.now();
    let time = 0;

    const drawMountains = (p: number) => {
      const layers = [
        { base: 0.82, amp: 0.07, freq: 2.1, color: mix("#6E65A5", "#10162F", p), parallax: 12 },
        { base: 0.9, amp: 0.05, freq: 3.4, color: mix("#183B70", "#05070F", p), parallax: 24 },
      ];
      for (const L of layers) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 12) {
          const nx = x / w;
          const y =
            h * L.base +
            Math.sin(nx * L.freq * Math.PI + 0.7) * h * L.amp +
            Math.sin(nx * L.freq * 3.1) * h * (L.amp * 0.35) +
            mouse.x * L.parallax;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = L.color;
        ctx.fill();
      }
    };

    const drawComet = (dt: number) => {
      if (!comet) return;
      comet.t += dt / 2600;
      if (comet.t >= 1) {
        comet = null;
        return;
      }
      const t = comet.t;
      const hx = w * (-0.1 + 1.2 * t) + mouse.x * 20;
      const hy = h * (0.08 + 0.45 * t) + mouse.y * 10;
      const tailLen = 260;
      const tx = hx - tailLen * 0.9;
      const ty = hy - tailLen * 0.4;
      const grad = ctx.createLinearGradient(hx, hy, tx, ty);
      grad.addColorStop(0, "rgba(255,255,255,0.95)");
      grad.addColorStop(0.2, "rgba(197,232,255,0.7)");
      grad.addColorStop(1, "rgba(244,155,192,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 26);
      glow.addColorStop(0, "rgba(255,255,255,1)");
      glow.addColorStop(0.3, "rgba(197,232,255,0.6)");
      glow.addColorStop(1, "rgba(197,232,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hx, hy, 26, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (!reduceMotion) time += dt;

      const p = progressRef.current;

      // Sky
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, sample(p, "top"));
      g.addColorStop(1, sample(p, "bottom"));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Stars fade in as dusk arrives
      const starAlpha = Math.max(0, (p - 0.3) * 1.6);
      if (starAlpha > 0) {
        for (const s of stars) {
          const tw = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(time * 0.002 + s.phase);
          ctx.globalAlpha = starAlpha * tw;
          ctx.fillStyle = "#F4F8FF";
          ctx.beginPath();
          ctx.arc(s.x * w + mouse.x * 8, s.y * h, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Clouds: soft radial blobs drifting slowly, parallax with mouse
      for (const c of clouds) {
        if (!reduceMotion) c.x = (c.x + c.speed * dt * c.depth) % 1.3;
        const cx = c.x * w - 0.15 * w + mouse.x * 40 * c.depth;
        const cy = c.y * h + mouse.y * 20 * c.depth;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.r);
        const alpha = 0.85 * (1 - p * 0.65);
        cg.addColorStop(0, `rgba(255,255,255,${alpha})`);
        cg.addColorStop(0.6, `rgba(255,255,255,${alpha * 0.45})`);
        cg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.ellipse(cx, cy, c.r * 1.6, c.r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating motes
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (const m of motes) {
        if (!reduceMotion) m.y = (m.y - m.drift * dt + 1) % 1;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Automatic comet every ~12 seconds (skipped for reduced motion)
      if (!reduceMotion && !comet && now > nextAutoComet) {
        comet = { t: 0 };
        nextAutoComet = now + 12000 + Math.random() * 6000;
      }
      drawComet(dt);

      drawMountains(p);

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    if (reduceMotion) {
      draw(performance.now());
      const onScrollStatic = () => draw(performance.now());
      window.addEventListener("scroll", onScrollStatic, { passive: true });
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("portfolio:comet", onComet);
        window.removeEventListener("scroll", onScrollStatic);
      };
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("portfolio:comet", onComet);
    };
  }, [progressRef]);

  return <canvas ref={canvasRef} className="sky-canvas" aria-hidden="true" />;
}
