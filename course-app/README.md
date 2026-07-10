# Course App

Next.js client for the **Agentic Memory Course**. Content is generated from [`../AI Agent Memory Course.md`](../AI%20Agent%20Memory%20Course.md).

## Scripts

```bash
npm run dev              # Development server (http://localhost:3000)
npm run build            # Generate modules.json + production build
npm run generate-course  # Regenerate lib/course/modules.json from markdown
npm run lint             # ESLint
```

## Key paths

- `app/` — routes (`/`, `/modules/[id]`)
- `components/` — UI (dashboard, lesson reader, sidebar, diagrams)
- `lib/course/` — course metadata and generated `modules.json`
- `scripts/generate-course-data.mjs` — markdown → JSON parser

## Contributing

See the root **[CONTRIBUTING.md](../CONTRIBUTING.md)** for full contribution instructions, content format rules, and PR workflow.
