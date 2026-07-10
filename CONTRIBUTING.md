# Contributing to Agentic Memory Course

Thank you for helping improve this course and its interactive web app. This guide explains how to set up the project, what to change for different kinds of contributions, and how to open a pull request.

## Project structure

```
.
├── AI Agent Memory Course.md   # Source of truth for all lesson content
├── CONTRIBUTING.md
├── README.md
└── course-app/                 # Next.js interactive course client
    ├── app/                    # Routes and layout
    ├── components/             # UI (dashboard, lesson reader, sidebar, diagrams)
    ├── context/                # React context (progress, etc.)
    ├── hooks/
    ├── lib/                    # Types, progress logic, generated course data
    ├── scripts/
    │   └── generate-course-data.mjs
    └── public/
```

**Course content** lives in `AI Agent Memory Course.md`. The app reads a generated JSON file — do not hand-edit `course-app/lib/course/modules.json` unless you are fixing a one-off build issue. Regenerate it from the markdown instead.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (or pnpm — lockfiles for both are present)
- A code editor and basic familiarity with Markdown, React, and TypeScript

## Local setup

```bash
git clone <your-fork-url>
cd "Agentic memory Course"

cd course-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful commands

| Command | Purpose |
|--------|---------|
| `npm run dev` | Start the development server |
| `npm run build` | Regenerate course data and produce a production build |
| `npm run generate-course` | Regenerate `lib/course/modules.json` from markdown only |
| `npm run lint` | Run ESLint |

Always run `npm run build` before opening a PR if you changed course content or app code.

## Types of contributions

### 1. Course content (lessons, checkpoints, examples)

Edit **`AI Agent Memory Course.md`** at the repository root.

**Module format** — each module must use this heading pattern (the generator depends on it):

```markdown
# MODULE 0 — Setup
```

**Checkpoints** — use one of these section headings inside a module:

```markdown
### Checkpoint questions
- First checkpoint item
- Second checkpoint item
```

or, for the capstone module:

```markdown
### Checkpoint — capstone completion criteria
- [ ] Criterion one
- [ ] Criterion two
```

**Lesson sections** — use `###` headings for subsections (intro, concepts, hands-on steps). Ordered lists under hands-on sections render as step cards in the UI.

After editing markdown:

```bash
cd course-app
npm run generate-course
```

Review the diff in `lib/course/modules.json`, then run the app and spot-check the affected module(s).

**Content guidelines**

- Keep the focus on **agentic memory** — concepts, architecture, and hands-on practice.
- Avoid product pitch, pricing, or go-to-market framing; the generator also applies text sanitization for legacy wording.
- Prefer clear, concise explanations and runnable code examples.
- Match the tone and depth of surrounding modules.

**Adding or renaming a module** also requires updating maps in `course-app/scripts/generate-course-data.mjs`:

- `LEVELS` — difficulty tier (Foundation, Core, Intermediate, etc.)
- `DIAGRAMS` — diagram key used by `components/Diagram.tsx`
- `TITLES` — display title in the sidebar and dashboard

If you add a module, update `generateStaticParams` coverage via the module count in the markdown and ensure a matching route exists under `app/modules/[id]/`.

### 2. UI and UX (components, styling, interactions)

Edit files under `course-app/components/`, `course-app/app/`, and `course-app/app/globals.css`.

**Design conventions**

- Monochrome palette: white backgrounds, `neutral-950` for primary actions and accents, gray borders and muted text.
- Reuse existing components (`ProgressBar`, `AnimatedCheckbox`, `LessonSectionCard`, etc.) before adding new ones.
- Sidebar collapse state is stored in `localStorage` under `agentic-memory-sidebar-collapsed`; progress uses `agentic-memory-course-progress-v2`.
- Prefer CSS transitions over heavy animation libraries.

**Diagram tab** — tab panels stay mounted in a CSS grid to avoid layout shift; preserve that pattern when changing `ModuleView`.

### 3. Diagrams

Diagram definitions live in `course-app/lib/diagrams.ts` and render via `components/Diagram.tsx`. Module-to-diagram mapping is in `generate-course-data.mjs` (`DIAGRAMS`).

When adding a diagram:

1. Add an SVG builder in `lib/diagrams.ts`.
2. Register the key in `DIAGRAMS` for the relevant module id.
3. Use the monochrome styles in `globals.css` (`.diagram-box`, `.diagram-arrow`, etc.).

### 4. Progress and course metadata

- **Per-checkpoint progress**: `lib/progress.ts`, `context/ProgressContext.tsx`
- **Course title, subtitle, pace**: `lib/course/index.ts` (`COURSE_META`)
- **Final completion checklist** (dashboard): `COMPLETION_CHECKLIST` in `scripts/generate-course-data.mjs`

### 5. Bugs and small fixes

1. Reproduce the issue on `main`.
2. Fix with the smallest change that solves the root cause.
3. Describe reproduction steps in the PR.

## Pull request workflow

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b fix/lesson-typo-module-3
   # or
   git checkout -b feat/sidebar-keyboard-shortcut
   ```

2. **Make your changes** and test locally (`npm run dev` and/or `npm run build`).

3. **Commit** with a clear message:
   ```
   Fix typo in Module 3 checkpoint wording

   Clarifies the re-ranking step without changing the learning objective.
   ```

4. **Push** and open a pull request against `main`.

5. **PR description** should include:
   - **What** changed and **why**
   - **How to test** (e.g. “Open Module 5 → Lesson tab → expand Hands-on section”)
   - Screenshots or short screen recordings for visible UI changes

## Code style

- **TypeScript**: follow existing patterns; avoid `any` unless unavoidable.
- **React**: client components use `"use client"` only when needed (hooks, browser APIs).
- **Tailwind**: utility classes inline; shared motion/layout in `globals.css` when reused.
- **Lint**: run `npm run lint` and fix new issues in files you touched.

## What we are looking for

- Lesson clarity, accuracy, and better examples
- Accessibility improvements (keyboard nav, ARIA labels, contrast)
- Responsive layout fixes
- Diagram and reader UX polish
- Typos and broken links in course material

## Questions

If you are unsure whether a change fits, open an issue describing your idea before investing in a large PR. For content changes, mention the module number and the learning goal you are trying to improve.

---

Thanks again for contributing. Every improvement helps learners build real agent memory systems.
