# SVR Kishore — Developer Portfolio

Static personal developer portfolio showcasing featured backend, full-stack, and applied AI projects alongside synced coding profile snapshots (GitHub, LeetCode, and GeeksforGeeks). Built with zero runtime dependencies or build tools.

## Features

- **Curated Project Showcase:** Prioritizes verified engineering repositories (`SpinCycle-Bikes`, `LandslideGuard NER`, `SmartFinance`, `GoYatri`, `HR Policy RAG Assistant`, `SVS Traders`) with honest prototype labels, team contribution notes, and working demo/repo links.
- **Interactive Filtering & Fallbacks:** Tag-based project filtering, `localStorage` caching, and graceful fallback states when snapshot JSON files are unavailable.
- **Automated Snapshot Sync:** Python script (`scripts/sync.py`) fetches GitHub repository metadata, LeetCode stats, and GeeksforGeeks stats, committing changes only when underlying data changes.
- **Accessibility & Theme Support:** Dark/light theme toggle, keyboard skip link, `prefers-reduced-motion` support, and responsive mobile navigation.

## Tech Stack

- **Frontend:** Semantic HTML5, modular CSS (`css/styles.css`), vanilla ES6+ JavaScript (`js/main.js`)
- **Data Sync:** Python 3 standard library (`scripts/sync.py`)
- **CI/CD:** GitHub Actions (`.github/workflows/sync.yml`, `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`)

## Architecture

```text
portfolio/
├── index.html                   Semantic page structure and static fallback cards
├── css/styles.css               Theme tokens, layout grid, responsive styles
├── js/main.js                   Project merging, filtering, profile rendering, animations
├── data/
│   ├── curated.json             Manually curated project order, badges, and summaries
│   ├── github.json              Synced public repository metadata
│   ├── leetcode.json            Synced LeetCode solve counts & calendar heatmap
│   └── gfg.json                 Synced GeeksforGeeks profile snapshot
├── scripts/
│   ├── config.json              Public usernames & profile URLs
│   └── sync.py                  GitHub / LeetCode / GFG fetcher (change-only writes)
└── .github/workflows/
    ├── ci.yml                   Syntax & JSON validation on push/PR
    ├── sync.yml                 Daily scheduled snapshot refresh
    └── deploy.yml               GitHub Pages deployment workflow
```

## Local Setup

No build step or package installation is required. Run any static HTTP server from the repository root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser (serving over HTTP allows `fetch()` to read `data/*.json`).

To run the data sync script locally:

```bash
python scripts/sync.py
```

## Environment Variables

- `GITHUB_TOKEN` *(optional locally, provided via `${{ secrets.GITHUB_TOKEN }}` in GitHub Actions)* — avoids GitHub API unauthenticated rate limits during repository and README fetching.

No private API keys or secrets are required or stored in the repository.

## Deployment Process

### GitHub Pages (Primary)

1. Push to `main`.
2. In repository **Settings → Pages**, ensure the source is set to **GitHub Actions**.
3. `.github/workflows/deploy.yml` publishes the static root automatically on pushes to `main` and after successful scheduled sync runs.

### Vercel (Optional)

Import the repository with framework preset **Other**, empty build command, and output directory `.`.

## Data Synchronization Workflow

- `.github/workflows/sync.yml` runs once daily (`17 6 * * *`) and supports manual `workflow_dispatch`.
- `scripts/sync.py` excludes forks, archived repositories, and repositories tagged `portfolio-hidden`.
- `data/curated.json` controls featured ordering, prototype/team badges, and curated summaries without being overwritten by automated syncs.
- Snapshots are only rewritten when non-timestamp fields actually change, avoiding noisy automated commits.

## Known Limitations

- Coding profile stats (LeetCode, GeeksforGeeks) reflect the latest scheduled snapshot rather than real-time webhooks.
- GeeksforGeeks statistics rely on public HTML parsing and may retain the last good snapshot if the upstream markup changes.
- The contact form opens a prefilled `mailto:` draft in the user's email client rather than submitting to a backend server.
