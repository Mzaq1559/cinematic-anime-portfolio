import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkyCanvas from "./components/SkyCanvas";
import World from "./world/World";
import AudioToggle from "./components/AudioToggle";
import VideoInterlude from "./components/VideoInterlude";
import { Hero, Journey, Experience, Education, Skills, Projects, Contact } from "./components/Scenes";
import { EVENTS, emit } from "./lib/events";

gsap.registerPlugin(ScrollTrigger);

const NAV = [
  ["home", "Home"],
  ["about", "About"],
  ["experience", "Experience"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["contact", "Contact"],
] as const;

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function App() {
  const progressRef = useRef(0);
  const boostRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [webgl] = useState(detectWebGL);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const use3D = webgl && !reduceMotion;

  // Scroll progress: drives the camera/sky (via progressRef) and the top bar.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progressRef.current})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cursor glow (fine pointers only).
  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  // Scroll-reveal animations, cleaned up through gsap.context.
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduceMotion) return;
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          },
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, [reduceMotion]);

  // Toast messages from 3D clicks.
  useEffect(() => {
    let timer = 0;
    const on = (e: Event) => {
      setToast((e as CustomEvent<{ text: string }>).detail.text);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), 3200);
    };
    window.addEventListener(EVENTS.toast, on);
    return () => {
      window.removeEventListener(EVENTS.toast, on);
      window.clearTimeout(timer);
    };
  }, []);

  // Arrow keys step between sections.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const target = e.target as HTMLElement;
      if (target.closest("input,textarea,select")) return;
      const secs = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
      const y = window.scrollY + window.innerHeight * 0.3;
      const next =
        e.key === "ArrowDown"
          ? secs.find((s) => s.offsetTop > y)
          : [...secs].reverse().find((s) => s.offsetTop < y - 20);
      if (next) {
        e.preventDefault();
        next.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const begin = () => {
    emit(EVENTS.startMusic);
    emit(EVENTS.comet);
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {use3D ? <World progressRef={progressRef} boostRef={boostRef} /> : <SkyCanvas progressRef={progressRef} />}

      <div className="cursor-glow" ref={cursorRef} aria-hidden="true" />
      <div className="progress" ref={barRef} aria-hidden="true" />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <nav className="floating-nav" aria-label="Primary">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <AudioToggle />

      <main ref={mainRef}>
        <Hero onBegin={begin} />
        <Journey />
        <VideoInterlude src="/videos/comet-sky.mp4" caption="Comet over the blue hour" />
        <Experience />
        <VideoInterlude src="/videos/tokyo-sunset.mp4" caption="Tokyo at golden hour" />
        <Education />
        <VideoInterlude src="/videos/railway-crossing.mp4" caption="A train at the crossing" />
        <Skills />
        <Projects />
        <VideoInterlude src="/videos/mountain-twilight.mp4" caption="Mountains at twilight" />
        <Contact />
      </main>
    </>
  );
}
