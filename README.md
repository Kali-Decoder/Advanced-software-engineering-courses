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

## Contributing

We welcome improvements to course content, UI, diagrams, and documentation. Please read **[CONTRIBUTING.md](./CONTRIBUTING.md)** for setup, conventions, and pull request guidelines before opening a PR.

## License

See repository license terms (if applicable). Course content and code are maintained for educational use.
