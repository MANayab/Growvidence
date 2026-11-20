# Growvidence

> **Don't just learn. Prove your progress.**

Growvidence is a proposed evidence-based skill tracker for IT beginners, students and self-taught learners.

**Status:** The Phase 1 static Astro foundation is implemented on [PR #3](https://github.com/MANayab/Growvidence/pull/3), which is open for maintainer review. The learner workspace and product workflows are not yet implemented. The committed lockfile supports reproducible installation, and the latest verified PR-head CI run passed.

**Hosting:** GitHub Pages static files only. No server, database, runtime SSR, API routes, mandatory accounts or cloud sync in the MVP.

**Data:** IndexedDB local persistence, versioned JSON export/import and selected CSV export are planned, not implemented. Browser storage is not cloud backup.

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

Use the Node.js and npm versions declared by `.nvmrc` and `package.json` (Node.js 26.7.0 and npm 11.19.0 or newer).

For a clean checkout:

```powershell
cd "$HOME\Documents\Growvidence"
git fetch origin
git checkout feat/phase-1-astro-foundation
git pull --ff-only origin feat/phase-1-astro-foundation
node --version
npm --version
npm ci
npm run format
npm run check
npm run lint
npm run format:check
npm test
npm run build
node scripts/verify-build.mjs
npm run dev
```

Open the local URL printed by Astro. Stop the dev server with Ctrl+C.

Use `npm ci` for reproducible clean installs from the committed `package-lock.json`. Use `npm install` only when intentionally changing dependencies; review and commit the resulting lockfile with those dependency changes. Do not delete or regenerate the lockfile as a routine setup step.

## Available commands

| Command | Purpose |
|---|---|
| `npm ci` | Install exactly from the committed lockfile |
| `npm run dev` | Start Astro's local development server |
| `npm run build` | Generate the static site in `dist/` |
| `npm run preview` | Preview the built site locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format application/config source files |
| `npm run format:check` | Check formatting without modifying files |
| `npm run check` | Run Astro diagnostics and TypeScript checks |
| `npm test` | Run Vitest unit tests |
| `node scripts/verify-build.mjs` | Verify required metadata in built HTML |

## Contributing

See CONTRIBUTING.md and AGENTS.md. Use focused branches and PRs; never push directly to main. Keep the lockfile synchronized with intentional dependency changes.

## License

No license has been approved. Do not assume reuse or redistribution rights. See ADR-0002. No LICENSE file is added.
