# STUDIO BOSS

<div align="center">
  <h3>A Hollywood Studio Management Simulation</h3>
  <p>Build your empire. Control the narrative.</p>
</div>

---

**STUDIO BOSS** is a dynamic simulation game where you take the helm of a film and television studio. Navigate the cutthroat entertainment industry, manage your project pipeline, handle the finances, and compete against rival studios to become the ultimate powerhouse in Hollywood.

## Features

- **Studio Management:** Choose your studio's archetype (Major, Mid-tier, Indie), start with initial capital, and build prestige.
- **Project Slate & Pipeline:** Greenlight and oversee film and TV projects through various stages (Development, Production, Released).
- **Financial Strategy:** Balance your checkbook with different budget tiers (Low, Mid, High, Blockbuster) and weekly operating costs. Track your weekly revenue vs expenses.
- **Dynamic Rivals:** Compete against procedurally generated rival studios that are constantly making their own moves.
- **News Feed & Events:** Stay updated with industry headlines spanning rival activities, market changes, talent updates, and award shows.
- **Save & Load:** Persistent saves allow you to pick up your studio empire right where you left off.

## Tech Stack

This project is built using a modern frontend stack:
- **TypeScript** - Type safety
- **React + Vite** - UI Library and Build tool
- **TanStack Router** - Navigation
- **Zustand** - State Management with slice pattern
- **Zod** - Schema validation
- **Web Workers** - Multithreading for simulation engine
- **OPFS** - Origin Private File System for persistence
- **Tailwind CSS + Radix** - Styling and Headless UI
- **Framer Motion** - Animations
- **Lucide** - Icons
- **Recharts** - Charts
- **Vitest + React Testing Library** - Unit and Integration Testing
- **Playwright** - End-to-End Testing
- **Electron** - Desktop application framework

---

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup instructions.

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Required variables:
- `GEMINI_API_KEY`: Google Generative AI API key for narrative generation

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run analyze` - Analyze bundle size
- `npm run electron:dev` - Run Electron app

## License

Private and proprietary.
