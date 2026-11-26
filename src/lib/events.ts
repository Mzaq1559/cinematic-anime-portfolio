// Tiny typed helper for cross-component events (3D scene <-> HTML sections).
export const EVENTS = {
  toast: "portfolio:toast",
  station: "portfolio:station",
  skill: "portfolio:skill",
  project: "portfolio:project",
  comet: "portfolio:comet",
  startMusic: "portfolio:start-music",
} as const;

export function emit(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
