import { useEffect, useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { owner, experience, education, skills, projects, projectCategories, type Project } from "../data/content";
import { EVENTS } from "../lib/events";

function Section({ id, className = "", children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`scene ${className}`}>
      {children}
    </section>
  );
}

/* ---------- Landing ---------- */
export function Hero({ onBegin }: { onBegin: () => void }) {
  return (
    <Section id="home" className="hero">
      <p className="kicker reveal">Welcome to my world.</p>
      <h1 className="hero-name reveal">{owner.name}</h1>
      <h2 className="hero-headline reveal">Every Journey Begins With a Dream.</h2>
      <p className="hero-sub reveal">A creative mind. A digital universe. Countless possibilities.</p>
      <button className="glow-btn reveal" onClick={onBegin}>
        Begin the Journey
      </button>
      <div className="scroll-hint" aria-hidden="true">
        SCROLL TO EXPLORE
      </div>
    </Section>
  );
}

/* ---------- Sky introduction ---------- */
export function Journey() {
  return (
    <Section id="about" className="journey">
      <p className="kicker reveal">Somewhere between imagination and reality...</p>
      <h2 className="display reveal">This is where my journey begins.</h2>
      <div className="glass panel reveal">
        <h3>{owner.name}</h3>
        <p className="accent">{owner.title}</p>
        <p>{owner.intro}</p>
        <p className="muted">Based in {owner.location}</p>
        <ul className="chips">
          {owner.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---------- Railway experience ---------- */
export function Experience() {
  const [active, setActive] = useState(0);
  const job = experience[active];

  // A station clicked in the 3D railway selects the matching career entry.
  useEffect(() => {
    const on = (e: Event) => setActive((e as CustomEvent<{ index: number }>).detail.index);
    window.addEventListener(EVENTS.station, on);
    return () => window.removeEventListener(EVENTS.station, on);
  }, []);

  return (
    <Section id="experience" className="experience">
      <h2 className="display reveal">The Railway Journey</h2>
      <div className="rail reveal" role="tablist" aria-label="Career stations">
        {experience.map((e, i) => (
          <button
            key={`${e.role}-${i}`}
            role="tab"
            aria-selected={i === active}
            className={`station ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="dot" />
            <span className="station-label">{e.period}</span>
          </button>
        ))}
      </div>
      <div className="glass panel reveal" key={active}>
        <h3>{job.role}</h3>
        <p className="accent">
          {job.org} · {job.period}
        </p>
        <h4>Responsibilities</h4>
        <ul>
          {job.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <h4>Achievements</h4>
        <ul>
          {job.achievements.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---------- School / education ---------- */
export function Education() {
  return (
    <Section id="education" className="education">
      <h2 className="display reveal">The Dreamy School</h2>
      <div className="edu-grid">
        {education.map((e) => (
          <article className="glass panel reveal" key={e.degree}>
            <h3>{e.degree}</h3>
            <p className="accent">
              {e.institution} · {e.year}
            </p>
            <ul>
              {e.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="muted">{e.details}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Constellation skills ---------- */
export function Skills() {
  const [active, setActive] = useState<number | null>(null);

  // A star clicked in the 3D constellation selects the matching skill group.
  useEffect(() => {
    const on = (e: Event) => setActive((e as CustomEvent<{ index: number }>).detail.index);
    window.addEventListener(EVENTS.skill, on);
    return () => window.removeEventListener(EVENTS.skill, on);
  }, []);

  const isLit = (i: number) => active !== null && (i === active || skills[active].links.includes(i));

  return (
    <Section id="skills" className="skills">
      <h2 className="display reveal">The Constellation</h2>
      <div className="constellation reveal">
        <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {skills.flatMap((s, i) =>
            s.links
              .filter((j) => j > i)
              .map((j) => {
                const t = skills[j];
                const lit = active !== null && (active === i || active === j);
                return <line key={`${i}-${j}`} x1={s.x} y1={s.y} x2={t.x} y2={t.y} className={lit ? "lit" : ""} />;
              }),
          )}
        </svg>
        {skills.map((s, i) => (
          <button
            key={s.name}
            className={`star ${isLit(i) ? "on" : ""} ${active === i ? "center" : ""}`}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            onClick={() => setActive(active === i ? null : i)}
            aria-pressed={active === i}
          >
            <span className="star-core" />
            <span className="star-label">{s.name}</span>
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="glass panel skill-panel" key={active}>
          <h3>{skills[active].name}</h3>
          <ul className="chips">
            {skills[active].skills.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

/* ---------- Project gallery ---------- */
export function Projects() {
  const [category, setCategory] = useState<string>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = projects
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => category === "All" || p.category === category);

  const close = () => setOpenIndex(null);
  const step = (dir: 1 | -1) =>
    setOpenIndex((i) => (i === null ? null : (i + dir + projects.length) % projects.length));

  // A glass pane clicked in the 3D gallery opens that project.
  useEffect(() => {
    const on = (e: Event) => setOpenIndex((e as CustomEvent<{ index: number }>).detail.index);
    window.addEventListener(EVENTS.project, on);
    return () => window.removeEventListener(EVENTS.project, on);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex]);

  const current: Project | null = openIndex !== null ? projects[openIndex] : null;

  return (
    <Section id="projects" className="projects">
      <h2 className="display reveal">The Memory Gallery</h2>
      <div className="filters reveal" role="group" aria-label="Filter projects">
        {["All", ...projectCategories].map((c) => (
          <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {visible.map(({ p, index }) => (
          <button key={p.title} className="glass project-card reveal" onClick={() => setOpenIndex(index)}>
            <span className="project-cat">{p.category}</span>
            <span className="project-title">{p.title}</span>
            <span className="project-desc">{p.description}</span>
          </button>
        ))}
      </div>

      {current && (
        <div className="modal-overlay" onClick={close}>
          <div className="glass modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="modal-close" onClick={close} aria-label="Close">
              ×
            </button>
            <p className="accent">{current.category}</p>
            <h3>{current.title}</h3>
            <p>{current.description}</p>
            <h4>Technologies</h4>
            <ul className="chips">
              {current.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <h4>Features</h4>
            <ul>
              {current.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="modal-actions">
              {current.liveUrl && (
                <a className="glow-btn" href={current.liveUrl} target="_blank" rel="noreferrer">
                  Visit project
                </a>
              )}
              {current.repoUrl && current.repoUrl !== "#" && (
                <a className="ghost-btn" href={current.repoUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              )}
            </div>
            <div className="modal-nav">
              <button onClick={() => step(-1)}>← Prev</button>
              <button onClick={() => step(1)}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ---------- Contact & finale ---------- */
export function Contact() {
  const [burst, setBurst] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No backend: this opens the visitor's mail client with the message pre-filled.
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\nReply to: ${email}`);
    window.location.href = `mailto:${owner.email}?subject=${subject}&body=${body}`;
  };

  return (
    <Section id="contact" className="contact">
      <p className="kicker reveal">Every journey has a beginning.</p>
      <h2 className="display reveal">Let's create something extraordinary.</h2>
      <p className="reveal">
        <a href={`mailto:${owner.email}`}>{owner.email}</a>
      </p>
      <div className="socials reveal">
        {owner.socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        ))}
      </div>
      <div className="reveal actions">
        <a className="ghost-btn" href={owner.cvUrl} download>
          Download CV
        </a>
        <button className="glow-btn" onClick={() => setBurst((b) => b + 1)}>
          Let's Connect
        </button>
      </div>

      <form className="contact-form glass reveal" onSubmit={onSubmit}>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Your message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button className="glow-btn" type="submit">
          Send message
        </button>
      </form>

      {burst > 0 && (
        <div className="burst" key={burst} aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => {
            const angle = (i / 28) * Math.PI * 2;
            return (
              <span
                key={i}
                className="particle"
                style={{
                  ["--dx" as string]: `${Math.cos(angle) * (80 + (i % 5) * 18)}px`,
                  ["--dy" as string]: `${Math.sin(angle) * (80 + (i % 5) * 18)}px`,
                }}
              />
            );
          })}
        </div>
      )}

      <p className="finale">Until our paths cross again...</p>
    </Section>
  );
}
