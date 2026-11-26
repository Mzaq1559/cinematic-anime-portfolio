# Cinematic Anime Portfolio

A cinematic, anime-inspired interactive portfolio built with **React, TypeScript, Vite and GSAP**.
All scenery is procedural or original. No movie frames, characters or logos are used.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

## Make it yours

| What | Where |
| --- | --- |
| Name, title, intro, socials, interests | `src/data/content.ts` → `owner` |
| Experience (railway stations) | `src/data/content.ts` → `experience` |
| Education panels | `src/data/content.ts` → `education` |
| Skill constellation (positions and links) | `src/data/content.ts` → `skills` |
| Projects (add real ones here) | `src/data/content.ts` → `projects` |
| CV | put `cv.pdf` in `public/` |
| Background music | put an original or licensed track at `public/audio/ambient.mp3` |
| Colours and typography | `src/styles.css` → `:root` variables |
| Sky palette over scroll | `src/components/SkyCanvas.tsx` → `STOPS` |

## Notes

- **Music** only starts after the visitor clicks *Begin the Journey*, which respects browser autoplay rules. If no track exists, the toggle shows "no track" and the site still works.
- **Contact form** has no backend. It opens the visitor's mail client with the message pre-filled.
- **Reduced motion** is respected: the sky becomes static and reveal animations are skipped.
- **Mobile** uses fewer stars, clouds and motes to keep frame rates smooth.

## Roadmap

- [ ] Replace placeholder content with real projects and experience
- [ ] Add Google Flow–generated scene videos (scroll-controlled `<video>` between sections, lazy-loaded and paused off-screen)
- [ ] Add Three.js / React Three Fiber for the 3D railway and city scenes
- [ ] Add the Framer Motion text reveals and the custom cursor's hover states
- [ ] Add a static fallback scene for unsupported devices
- [ ] Deploy to GitHub Pages (`base: "./"` is already set)

## Credits and originality

Inspiration comes from the atmosphere of *Your Name* (Makoto Shinkai style). All artwork, music and copy here are original. Do not replace them with copyrighted film frames, soundtrack audio or character art.
