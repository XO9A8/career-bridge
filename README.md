# CareerBridge – AI-Powered Career Roadmap UI

CareerBridge is a featurerich, front-end prototype designed for the **AI-Powered Career Roadmap Platform** idea developed for a university hackathon.  
The interface blends a Metamask-inspired aesthetic with glassmorphism, neon accents, and Framer Motion transitions to deliver a futuristic yet approachable experience for students and fresh graduates exploring their next career move.

## Highlights

- **Immersive dashboard** with quick stats, job recommendations, learning paths, and an AI momentum indicator.
- **Filterable jobs marketplace** featuring skill tags, search, sort, and a slide-in detail modal with responsibilities, requirements, and perks.
- **Learning resources hub** with skill/cost filters, animated cards, and immediate “Visit” actions.
- **Profile studio** for editing personal information, tracking key skills, and managing CV notes with inline add/remove controls.
- **Auth split-screen** showcasing login/register flows, validation hints, and a motivational hero with gradient overlays.
- **Framer Motion transitions** and polished hover states bringing cohesion across navigation, cards, and CTAs.

All views are implemented in a single-page layout with state-driven routing for the hackathon demo.

## Tech Stack

- **React 19 + Vite**
- **Framer Motion** for page transitions
- **React Icons** for navigation and UI iconography
- Custom CSS with glassmorphism, gradients, and responsive grid layouts

## Quick Start

```bash
git clone https://github.com/tamim2763/career-bridge.git
cd career-bridge
npm install
npm run dev
```

Navigate to `http://localhost:5173` to explore the prototype.

## Project Structure

```
career-bridge/
├── public/                 # Static assets (favicons, preview images)
├── src/
│   ├── App.jsx             # Main UI with stateful navigation
│   ├── App.css             # Component and layout styling
│   ├── index.css           # Global styles & fonts
│   └── main.jsx            # React entry point
├── package.json
└── README.md
```

## Current Experience

- **Dashboard** – Overview of user profile snapshot, recommended jobs, and curated resources.
- **Jobs** – Search and filter roles with instant feedback and an animated detail modal.
- **Resources** – Skill-based and cost-based filters with clean card layouts.
- **Profile** – Edit personal data, manage skills dynamically, and keep CV highlights handy.
- **Auth** – Toggle between login and register inside a hopeful, split layout hero.

Each section is fully wired to demo interactions using static data, ideal for presentations and future integration work.

## License

This project is available for hackathon showcasing and further iteration. Feel free to fork and build on top of it.
