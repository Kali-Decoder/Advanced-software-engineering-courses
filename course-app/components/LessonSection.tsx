"use client";

import type { LessonSection, SectionType } from "@/lib/parse-lesson";
import { MarkdownContent } from "./MarkdownContent";

const STYLES: Record<
  SectionType,
  { border: string; bg: string; label: string; icon?: string }
> = {
  intro: {
    border: "border-neutral-200",
    bg: "bg-neutral-50",
    label: "Overview",
    icon: "01",
  },
  concept: {
    border: "border-neutral-200",
    bg: "bg-white",
    label: "Concept",
    icon: "02",
  },
  example: {
    border: "border-blue-200",
    bg: "bg-blue-50/40",
    label: "Real Example",
    icon: "★",
  },
  diagram: {
    border: "border-neutral-950",
    bg: "bg-gradient-to-br from-neutral-50 to-white",
    label: "Architecture",
    icon: "◈",
  },
  video: {
    border: "border-red-200",
    bg: "bg-gradient-to-br from-red-50/50 to-white",
    label: "Video Tutorial",
    icon: "▶",
  },
  "hands-on": {
    border: "border-neutral-950",
    bg: "bg-white",
    label: "Hands-on",
    icon: "🛠",
  },
  checkpoint: {
    border: "border-neutral-300",
    bg: "bg-neutral-50",
    label: "Key Terms",
    icon: "◉",
  },
};

interface LessonSectionCardProps {
  section: LessonSection;
  index: number;
  open: boolean;
  onToggle: () => void;
}

export function LessonSectionCard({
  section,
  index,
  open,
  onToggle,
}: LessonSectionCardProps) {
  const style = STYLES[section.type];

  return (
    <section
      id={section.id}
      className={`scroll-mt-28 overflow-hidden rounded-xl border transition-all duration-200 ${style.border} ${style.bg} ${
        open ? "shadow-sm" : "hover:border-neutral-950"
      } ${section.type === "diagram" ? "ring-1 ring-neutral-950/5" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        aria-expanded={open}
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-[0.6rem] font-bold uppercase tracking-wider ${
            section.type === "diagram"
              ? "border border-neutral-950 bg-neutral-950 text-white"
              : section.type === "video"
                ? "border border-red-200 bg-red-600 text-white"
                : "border border-neutral-200 bg-white text-neutral-500"
          }`}
        >
          {style.icon ?? String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`mb-1 block text-[0.65rem] font-semibold uppercase tracking-widest ${
              section.type === "video"
                ? "text-red-600"
                : section.type === "diagram"
                  ? "text-neutral-950"
                  : "text-neutral-400"
            }`}
          >
            {style.label}
          </span>
          <span className="font-serif text-lg font-semibold leading-snug text-neutral-950 sm:text-xl">
            {section.title}
          </span>
        </span>
        <span
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-transform duration-300 ${
            open ? "rotate-180 border-neutral-950 text-neutral-950" : ""
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3 5.5L7 9.5L11 5.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`border-t px-5 pb-6 pt-4 sm:px-6 sm:pb-8 ${
              section.type === "diagram"
                ? "border-neutral-200 bg-white/50"
                : "border-neutral-100"
            }`}
          >
            <MarkdownContent
              content={section.content}
              variant={section.type}
              sectionTitle={section.title}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface LessonTOCProps {
  sections: LessonSection[];
  activeId: string | null;
  onJump: (id: string) => void;
}

export function LessonTOC({ sections, activeId, onJump }: LessonTOCProps) {
  return (
    <nav aria-label="Lesson sections">
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
        On this page
      </p>
      <ul className="space-y-0.5">
        {sections.map((s) => {
          const active = activeId === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onJump(s.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all ${
                  active
                    ? "bg-neutral-950 font-medium text-white"
                    : "text-neutral-600 hover:bg-white hover:text-neutral-950"
                }`}
              >
                <span className="line-clamp-2">{s.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function LessonTOCMobile({ sections, activeId, onJump }: LessonTOCProps) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onJump(s.id)}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeId === s.id
              ? "border-neutral-950 bg-neutral-950 text-white"
              : "border-neutral-200 bg-white text-neutral-600"
          }`}
        >
          {s.title.length > 28 ? `${s.title.slice(0, 28)}…` : s.title}
        </button>
      ))}
    </div>
  );
}
