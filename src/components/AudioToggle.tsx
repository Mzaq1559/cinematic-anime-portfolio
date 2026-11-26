import { useEffect, useRef, useState } from "react";

/**
 * Persistent background music. The <audio> element lives outside the scene
 * flow, so scrolling never restarts it. Playback begins only after a user
 * gesture (the "Begin the Journey" button dispatches `portfolio:start-music`).
 * Drop an original or licensed track at public/audio/ambient.mp3 to enable it.
 */
export default function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const start = () => {
      const a = audioRef.current;
      if (!a || unavailable) return;
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setUnavailable(true));
    };
    window.addEventListener("portfolio:start-music", start);
    return () => window.removeEventListener("portfolio:start-music", start);
  }, [unavailable]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setUnavailable(true));
    }
  };

  return (
    <div className="audio-ctl">
      <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="none" onError={() => setUnavailable(true)} />
      <button onClick={toggle} disabled={unavailable} aria-pressed={playing} aria-label="Toggle music">
        {unavailable ? "♪ no track" : playing ? "♪ on" : "♪ off"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Music volume"
        disabled={unavailable}
      />
    </div>
  );
}
