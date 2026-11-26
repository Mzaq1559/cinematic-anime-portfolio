import { useEffect, useRef, useState } from "react";

/**
 * A full-width cinematic clip that scrubs with scroll while on screen.
 * Only the visible interlude decodes frames. If the file is missing, it shows
 * a gradient fallback, so the site still works before you add your Flow clips.
 */
export default function VideoInterlude({ src, caption }: { src: string; caption: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const v = video.current;
    if (!el || !v) return;
    let visible = false;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) v.preload = "auto";
    });
    io.observe(el);

    const onScroll = () => {
      if (!visible || !v.duration || Number.isNaN(v.duration)) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the clip enters from the bottom, 1 when it leaves at the top
      const t = THREE_clamp((vh - r.top) / (vh + r.height));
      v.currentTime = t * v.duration;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="interlude" ref={wrap}>
      {failed ? (
        <div className="interlude-fallback" aria-hidden="true" />
      ) : (
        <video
          ref={video}
          src={src}
          muted
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      )}
      <p className="interlude-caption">{caption}</p>
    </div>
  );
}

function THREE_clamp(x: number) {
  return Math.min(1, Math.max(0, x));
}
