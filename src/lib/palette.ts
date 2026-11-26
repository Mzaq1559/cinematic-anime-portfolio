import * as THREE from "three";

// Sky palette stops from the project's colour spec.
const STOPS = [
  { at: 0, top: "#65B9ED", bottom: "#F4F8FF" },
  { at: 0.35, top: "#6E65A5", bottom: "#FFB36A" },
  { at: 0.7, top: "#183B70", bottom: "#F49BC0" },
  { at: 1, top: "#10162F", bottom: "#183B70" },
];

/** Interpolated sky colours for a scroll progress value in [0, 1]. */
export function skyAt(p: number) {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (p <= b.at) {
      const t = THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1);
      return {
        top: new THREE.Color(a.top).lerp(new THREE.Color(b.top), t),
        bottom: new THREE.Color(a.bottom).lerp(new THREE.Color(b.bottom), t),
      };
    }
  }
  const last = STOPS[STOPS.length - 1];
  return { top: new THREE.Color(last.top), bottom: new THREE.Color(last.bottom) };
}
