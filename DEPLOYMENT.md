# Deployment Guide

## Overview

This document provides instructions for deploying Studio Boss to production environments.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- Electron (for desktop builds)

## Environment Setup

### Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

## Building for Production

### Web Build

```bash
bun install
bun run build
```

The production build will be in the `dist/` directory.

### Electron Desktop Builds

#### macOS
```bash
bun run electron:build
```

#### Windows
```bash
bun run electron:build:win
```

#### All Platforms
```bash
bun run electron:build:all
```

## Deployment Options

### Static Web Hosting

The `dist/` folder can be deployed to any static hosting service:

- **Vercel**: `vercel deploy dist`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **GitHub Pages**: Push `dist/` to `gh-pages` branch
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket

### Electron Distribution

Desktop builds are created in the `release/` directory.

#### macOS
- Distribute the `.dmg` file
- Requires code signing for distribution outside Mac App Store

#### Windows
- Distribute the `.exe` installer
- Requires code signing for distribution

## CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Runs tests on pull requests and pushes
2. Performs type checking
3. Runs linting
4. Builds the production bundle
5. Uploads build artifacts

## Testing Before Deployment

```bash
# Run all tests
bun run test

# Run type checking
bun run type-check

# Run linting
bun run lint

# Build verification
bun run build
```

## Performance Considerations

- The production build is optimized with Vite
- Large component lists may benefit from virtualization (see virtualization TODO)
- Consider enabling compression on your web server (gzip/brotli)

## Security Notes

- CSP policy is configured in `index.html`
- Never commit `.env` files with real API keys
- Use environment-specific API keys
- Enable HTTPS in production

## Troubleshooting

### Build Fails
- Clear cache: `rm -rf node_modules .vite dist`
- Reinstall dependencies: `bun install`
- Check Node/Bun version compatibility

### Electron Build Fails
- Ensure Electron Builder is properly configured in `package.json`
- Check platform-specific build requirements
- Verify code signing certificates (for distribution)

### Runtime Errors
- Check browser console for errors
- Verify environment variables are set
- Ensure API keys are valid and have proper permissions
