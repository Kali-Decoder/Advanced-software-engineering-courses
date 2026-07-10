# Agentic Memory Course

An interactive course on **AI agent memory systems** — concepts, architecture, and hands-on practice. Lesson content is authored in Markdown and served through a Next.js web app with module navigation, progress tracking, diagrams, and checkpoints.

## Repository layout

| Path | Description |
|------|-------------|
| [`AI Agent Memory Course.md`](./AI%20Agent%20Memory%20Course.md) | Course source (14 modules) |
| [`course-app/`](./course-app/) | Next.js interactive client |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | How to contribute |

## Quick start

```bash
cd course-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To regenerate course data after editing the markdown:

```bash
cd course-app
npm run generate-course
```

Production build:

```bash
cd course-app
npm run build
npm start
```

## Features

- Dashboard with level-grouped modules and overall progress
- Collapsible lesson reader with section navigation
- Concept diagrams per module
- Checkpoint lists with localStorage persistence
- Monochrome, responsive UI

## Deploy to Vercel

The Next.js app lives in **`course-app/`**, not the repository root. A 404 on Vercel usually means the wrong root directory was selected.

### Option A (recommended)

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. Open **Project Settings → General → Root Directory**.
3. Set root directory to **`course-app`**.
4. Leave **Framework Preset** as **Next.js**.
5. **Build Command:** `npm run build` (default).
6. Redeploy.

### Option B (repo root)

This repo includes a root [`vercel.json`](./vercel.json) that builds `course-app/` when the project root is the repository itself. Push the latest commits, then trigger a **Redeploy** in Vercel.

### Still seeing 404?

- Confirm the latest code is pushed (`course-app/` must be in the repo).
- Check the Vercel **Deployments** tab for a failed build.
- Use `/` for the home page and `/modules/0` for module routes (note the plural `modules`).

## Contributing

We welcome improvements to course content, UI, diagrams, and documentation. Please read **[CONTRIBUTING.md](./CONTRIBUTING.md)** for setup, conventions, and pull request guidelines before opening a PR.

## License

See repository license terms (if applicable). Course content and code are maintained for educational use.
