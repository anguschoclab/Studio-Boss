# Contributing to Studio Boss

Thank you for your interest in contributing to Studio Boss!

## Development Setup

### Prerequisites
- Bun (v1.1 or higher)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Studio-Boss

# Install dependencies
bun install

# Start development server
bun run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:
- `GEMINI_API_KEY`: Google Generative AI API key for narrative generation

## Development Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run build:dev` - Build for development
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint issues automatically
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting
- `bun run test` - Run tests
- `bun run test:watch` - Run tests in watch mode
- `bun run analyze` - Analyze bundle size
- `bun run electron:dev` - Run Electron app in development mode

## Tech Stack

- **TypeScript** - Type safety
- **React + Vite** - UI Library and Build tool
- **TanStack Router** - Navigation
- **Zustand** - State Management with slice pattern
- **Tailwind CSS + Radix** - Styling and Headless UI
- **Framer Motion** - Animations
- **Recharts** - Charts
- **Vitest + React Testing Library** - Unit and Integration Testing
- **Playwright** - End-to-End Testing
- **Electron** - Desktop application framework

## Code Style

- Use Prettier for code formatting (run `bun run format` before committing)
- Follow ESLint rules (run `bun run lint` before committing)
- Use TypeScript for type safety
- Follow existing code patterns and conventions

## Testing

- Write unit tests for utility functions and business logic
- Write integration tests for components
- Run `bun run test` before committing
- Ensure all tests pass

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
