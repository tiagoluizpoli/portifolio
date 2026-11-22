// PROTOTYPE content. Real text from LinkedIn (2026-08-20). Items marked sample:true are placeholders.
window.CONTENT = {
  en: {
    name: "Tiago Luiz Poli",
    role: "Senior Software Engineer",
    pitch: "I build and run real products end to end: from the interface to the backend to the servers they live on.",
    location: "São Paulo, Brazil · Remote",
    cta: { whatsapp: "Message on WhatsApp", cv: "Download CV" },
    nav: { projects: "Projects", experience: "Experience", skills: "Skills", about: "About", contact: "Contact" },
    stats: { sample: true, items: [
      { value: 1284, label: "contributions in the last year" },
      { value: 47, label: "public repos" },
      { value: null, text: "TypeScript · C# · Go", label: "top languages" }
    ]},
    projectsTitle: "Showcase projects",
    projects: [
      { sample: true, title: "Church", status: "live-evolving", statusLabel: "In production · Actively developed",
        now: "Now: online giving and event check-in.",
        summary: "A management platform for churches: members, ministries, events and finances in one place.",
        role: "Solo: product, design, code, infra", stack: ["Astro", "React", "Node.js", "PostgreSQL", "Dokploy"],
        images: 2, link: "#" },
      { sample: true, title: "Project two", status: "soon", statusLabel: "Coming soon", now: null,
        summary: "Placeholder for the next Showcase project.", role: "Solo", stack: ["TypeScript", "Hono"], images: 1, link: "#" }
    ],
    experienceTitle: "Experience",
    experience: [
      { company: "Coforge", role: "Senior Software Engineer", period: "Mar 2026 – Present", place: "Remote · US",
        bullets: ["Leading a Strangler Fig migration from .NET Framework to modern .NET with zero downtime.", "Designed a sessionless architecture with distributed caching and encrypted cookies."] },
      { company: "TIVIT", role: "Senior Software Engineer", period: "Apr 2023 – Mar 2026", place: "Remote · Rio de Janeiro",
        bullets: ["Led a multi-tenant SaaS for identity validation and fraud prevention.", "Extended AWS Cognito for dynamic multi-tenancy; built AI workflows with OpenAI and Azure OpenAI."] },
      { company: "Kronus Tecnologia", role: "Software Engineer (Freelance)", period: "Jan 2022 – Sep 2025", place: "Remote · São Paulo",
        bullets: ["Full-stack apps integrating credit-analysis and background-check APIs."] },
      { company: "Mobdec", role: "Software Engineer", period: "Feb 2022 – Mar 2023", place: "Remote · São Paulo",
        bullets: ["Distributed GPU pipeline for 3D file conversion using queues.", "Backend services in Clean Architecture; payments integration."] },
      { company: "Self-employed", role: "Software Engineer", period: "May 2015 – Jun 2021", place: "São Paulo",
        bullets: ["Custom business systems, automation tools and data processing for multiple clients."] }
    ],
    skillsTitle: "Skills",
    skills: [
      { group: "Languages", items: ["TypeScript", "JavaScript", "C#", "SQL"] },
      { group: "Backend", items: ["Node.js", ".NET", "Hono", "REST", "CQRS", "Microservices"] },
      { group: "Frontend", items: ["React", "Astro", "Tailwind CSS"] },
      { group: "Data", items: ["PostgreSQL", "SQL Server", "MongoDB", "DynamoDB"] },
      { group: "Cloud & infra", items: ["AWS", "Azure", "Docker", "Terraform", "Dokploy", "GitHub Actions"] },
      { group: "AI", items: ["OpenAI", "Azure OpenAI", "AWS Textract", "Rekognition"] }
    ],
    aboutTitle: "About",
    about: "Senior Software Engineer building scalable, cloud-native systems in Node.js, TypeScript, .NET and React. I've led multi-tenant SaaS platforms, custom authentication, AI document-processing workflows and high-scale data pipelines, and I modernise legacy systems without stopping them.",
    education: { school: "UNIASSELVI", degree: "Associate Degree, Systems Analysis and Development", period: "2024 – 2026 (in progress)" },
    contactTitle: "Let's talk",
    contact: { whatsapp: "WhatsApp", linkedin: "LinkedIn", email: "Email", github: "GitHub", cv: "CV (PDF)" }
  },
  pt: {
    name: "Tiago Luiz Poli",
    role: "Engenheiro de Software Sênior",
    pitch: "Construo e opero produtos reais de ponta a ponta: da interface ao backend e aos servidores onde rodam.",
    location: "São Paulo, Brasil · Remoto",
    cta: { whatsapp: "Conversar no WhatsApp", cv: "Baixar CV" },
    nav: { projects: "Projetos", experience: "Experiência", skills: "Skills", about: "Sobre", contact: "Contato" },
    statLabels: ["contribuições no último ano", "repositórios públicos", "principais linguagens"],
    statusLabels: { "live-evolving": "Em produção · Em evolução", live: "Em produção", soon: "Em breve" },
    note: "PT shown for header/hero only in the prototype; sections reuse EN text."
  },
  links: { whatsapp: "https://wa.me/5500000000000", linkedin: "https://www.linkedin.com/in/tiago-seuaciuc/", email: "mailto:hello@example.com", github: "https://github.com/tiagoluizpoli", cv: "#" }
};
