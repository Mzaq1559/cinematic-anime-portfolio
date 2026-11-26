// All portfolio copy lives here. Replace the placeholder values with your own.
// Nothing sensitive (phone, personal email) should be committed to a public repo.

export const owner = {
  name: "Muhammad Zulqarnain Abdullah",
  title: "Computer Science Student · AI/ML Researcher in the making",
  intro:
    "I build full-stack applications and study AI/ML, with a focus on research that makes intelligent systems genuinely useful.",
  location: "Taxila, Pakistan",
  interests: [
    "Applied machine learning",
    "Retrieval-augmented generation",
    "Full-stack web engineering",
    "Graduate research abroad",
  ],
  email: "your.email@example.com", // TODO: replace
  cvUrl: "/cv.pdf", // put your CV at public/cv.pdf
  socials: [
    { label: "GitHub", href: "https://github.com/Mzaq1559" },
    { label: "LinkedIn", href: "#" }, // TODO
    { label: "Instagram", href: "#" }, // TODO
  ],
};

export const experience = [
  {
    role: "Role title (replace)",
    org: "Organisation (replace)",
    period: "2025 – Present",
    responsibilities: ["Describe a key responsibility", "Describe another responsibility"],
    achievements: ["Describe a measurable achievement"],
  },
  {
    role: "Earlier role (replace)",
    org: "Organisation (replace)",
    period: "2024 – 2025",
    responsibilities: ["Describe a responsibility"],
    achievements: ["Describe an achievement"],
  },
];

export const education = [
  {
    degree: "BS Computer Science",
    institution: "UET Taxila",
    year: "Update years",
    achievements: ["CGPA 3.6 / 4.0"],
    details: "Coursework and projects in algorithms, databases, and machine learning.",
  },
];

// x / y are percentages of the constellation box. `links` = indices of connected stars.
export const skills = [
  { name: "Frontend", x: 18, y: 30, links: [1, 3], skills: ["React", "TypeScript", "Vite", "CSS"] },
  { name: "Backend", x: 42, y: 16, links: [0, 2, 4], skills: ["FastAPI", "Node.js", "REST APIs"] },
  { name: "Databases", x: 72, y: 28, links: [1, 5], skills: ["SQL Server", "PostgreSQL", "Data modelling"] },
  { name: "UI / UX", x: 26, y: 66, links: [0, 4], skills: ["Interface design", "Prototyping"] },
  { name: "Languages", x: 56, y: 56, links: [1, 3, 5], skills: ["Python", "TypeScript", "C++", "AVR Assembly"] },
  { name: "AI / ML", x: 82, y: 70, links: [2, 4], skills: ["Machine learning", "RAG pipelines", "PyTorch"] },
];

export const projectCategories = [
  "Web Applications",
  "Full Stack Projects",
  "AI Applications",
  "Data Engineering",
  "Creative Websites",
  "UI/UX Experiments",
] as const;

export type Project = {
  title: string;
  category: (typeof projectCategories)[number];
  description: string;
  tech: string[];
  features: string[];
  liveUrl?: string;
  repoUrl?: string;
  image?: string; // optional path under /public, e.g. "/projects/medibook.webp"
};

export const projects: Project[] = [
  {
    title: "MediBook AI",
    category: "AI Applications",
    description:
      "An AI virtual receptionist for clinics with RAG-based patient triage. Built for a national AI hackathon. (Replace with your own wording.)",
    tech: ["Python", "RAG", "LLM APIs"],
    features: ["Conversational booking", "Retrieval-based triage", "Clinic-friendly flows"],
    repoUrl: "https://github.com/Mzaq1559/MEDIBOOK_AI",
  },
  {
    title: "My Learning Diary",
    category: "Web Applications",
    description:
      "A serverless blog built on GitHub Pages with a React front end and a Markdown-based content workflow.",
    tech: ["React", "TypeScript", "GitHub Pages"],
    features: ["Markdown posts", "Static hosting", "Responsive layout"],
    liveUrl: "https://mzaq1559.github.io/My-Learning-Diary",
    repoUrl: "#",
  },
  {
    title: "SiteFlowAI",
    category: "Full Stack Projects",
    description:
      "A FastAPI and React application deployed to Azure App Service using Docker and Azure Container Registry. (Replace with your own wording.)",
    tech: ["FastAPI", "React", "Docker", "Azure"],
    features: ["REST API backend", "Containerised deployment", "Cloud hosting"],
    repoUrl: "#",
  },
  {
    title: "Placeholder Creative Site",
    category: "Creative Websites",
    description: "Dummy entry. Swap in a real creative project.",
    tech: ["CSS", "GSAP"],
    features: ["Scroll animation", "Custom cursor"],
  },
];
