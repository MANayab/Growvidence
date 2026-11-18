# Growvidence

> **Don't just learn. Prove your progress.**

Growvidence is a proposed evidence-based skill tracker for IT beginners, students and self-taught learners.

**Status:** Architecture revision / pre-implementation. Phase 0 documentation is merged. Static GitHub Pages and local-first design are proposed in the current documentation PR; no working app exists yet.

**Hosting:** GitHub Pages static files only. No server, database, runtime SSR, API routes, mandatory accounts or cloud sync in MVP.

**Data:** IndexedDB local persistence, planned versioned JSON export/import and selected CSV export. Browser storage is not cloud backup.

**Name:** Working name only; trademark, domain, company and app-store availability are not cleared.

## Product idea
A course completion or checked task is not proof of independent capability. Growvidence connects learning activity, practice, artifacts, independent demonstration and feedback.

## Planned capabilities
Daily/weekly/monthly tasks; learning log and AI-use disclosure; evidence links and competency criteria; JSON backup/restore; CSV export; responsive local-first PWA; public learning guides. These are plans, not shipped features.

## Documentation
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [SEO/AEO/GEO plan](docs/SEO_AEO_GEO.md)
- [Product principles](mind.md)
- [Project memory](brain.md)
- [Quality gates](docs/QUALITY_GATES.md)
- [ADRs](docs/DECISIONS/)

## Local development (Windows PowerShell)

Requirements: Node.js 26.7.0 and npm 11.19.0 or newer. Use the version in .nvmrc.

```powershell
cd "$HOME\Documents\Growvidence"
git fetch
git checkout feat/phase-1-astro-foundation
git pull
node --version
npm --version
npm install
npm run check
npm run lint
npm run format:check
npm test
npm run build
npm run dev
```

Open the local URL printed by Astro. Stop the dev server with Ctrl+C.

npm install creates/updates package-lock.json. Commit that file to this feature branch; CI intentionally fails with an explicit message until the lockfile is present. Once committed, use npm ci for clean reproducible installs.

## Available commands

| Command | Purpose |
|---|---|
| npm run dev | Start Astro's local development server |
| npm run build | Generate the static site in dist/ |
| npm run preview | Preview the built site locally |
| npm run lint | Run ESLint |
| npm run format | Format application/config source files |
| npm run format:check | Check formatting without modifying files |
| npm run check | Run Astro diagnostics and TypeScript checks |
| npm test | Run Vitest unit tests |

## Contributing
See CONTRIBUTING.md and AGENTS.md. Use focused branches and PRs; never push directly to main.

## License
No license has been approved. Do not assume reuse or redistribution rights. See ADR-0002. No LICENSE file is added.
