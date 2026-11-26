import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkyCanvas from "./components/SkyCanvas";
import AudioToggle from "./components/AudioToggle";
import { Hero, Journey, Experience, Education, Skills, Projects, Contact } from "./components/Scenes";

gsap.registerPlugin(ScrollTrigger);

const NAV = [
  ["home", "Home"],
  ["about", "About"],
  ["experience", "Experience"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["contact", "Contact"],
] as const;

export default function App() {
  const progressRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll progress: drives the sky palette (via progressRef) and the top bar.
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

  // Soft glow that follows the cursor (disabled on touch / reduced-motion).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Scroll-reveal animations. gsap.context gives clean teardown (ScrollTrigger cleanup).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        if (reduce) return;
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
  }, []);

  const begin = () => {
    window.dispatchEvent(new Event("portfolio:start-music"));
    window.dispatchEvent(new Event("portfolio:comet"));
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SkyCanvas progressRef={progressRef} />
      <div className="cursor-glow" ref={cursorRef} aria-hidden="true" />
      <div className="progress" ref={barRef} aria-hidden="true" />

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
        <Experience />
        <Education />
        <Skills />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
