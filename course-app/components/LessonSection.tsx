"use client";

import { useState } from "react";
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
    icon: "◎",
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
    border: "border-emerald-200",
    bg: "bg-gradient-to-br from-emerald-50/40 to-white",
    label: "Hands-on",
    icon: "🛠",
  },
  checkpoint: {
    border: "border-neutral-300",
    bg: "bg-neutral-50",
    label: "Reference",
    icon: "◉",
  },
  "deep-dive": {
    border: "border-indigo-200",
    bg: "bg-gradient-to-br from-indigo-50/40 to-white",
    label: "Deep Dive",
    icon: "▤",
  },
  part: {
    border: "border-indigo-300",
    bg: "bg-gradient-to-br from-indigo-50/60 via-white to-white",
    label: "Part",
    icon: "§",
  },
  submodule: {
    border: "border-neutral-200",
    bg: "bg-white",
    label: "Topic",
    icon: "•",
  },
};

function SubmoduleCard({
  submodule,
  index,
  open,
  onToggle,
}: {
  submodule: LessonSection;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const hasDiagram = submodule.content.includes("```mermaid");

  return (
    <article
      id={submodule.id}
      className={`scroll-mt-28 overflow-hidden rounded-lg border transition-all duration-200 ${
        open
          ? "border-neutral-950 bg-white shadow-sm"
          : "border-neutral-200/80 bg-white/80 hover:border-neutral-400"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-[0.65rem] font-bold text-neutral-700">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-neutral-950">{submodule.title}</span>
          {hasDiagram && !open && (
            <span className="mt-0.5 block text-[0.65rem] text-neutral-400">
              Includes diagram
            </span>
          )}
        </span>
        <span
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-100 px-4 pb-4 pt-3 sm:px-5">
            <MarkdownContent
              content={submodule.content}
              variant="submodule"
              sectionTitle={submodule.title}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function SubmoduleGrid({
  submodules,
  partNumber,
}: {
  submodules: LessonSection[];
  partNumber?: number;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenIds(new Set(submodules.map((s) => s.id)));
  const collapseAll = () => setOpenIds(new Set());

  return (
    <div className="submodule-grid mt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2">
        <p className="text-xs font-medium text-neutral-600">
          {partNumber != null && (
            <span className="mr-2 font-semibold text-indigo-600">
              Part {partNumber}
            </span>
          )}
          {submodules.length} topic{submodules.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:border-neutral-950"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            Collapse
          </button>
        </div>
      </div>
      <div className="grid gap-2">
        {submodules.map((sub, i) => (
          <SubmoduleCard
            key={sub.id}
            submodule={sub}
            index={i}
            open={openIds.has(sub.id)}
            onToggle={() => toggle(sub.id)}
          />
        ))}
      </div>
    </div>
  );
}

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
  const submoduleCount = section.submodules?.length ?? 0;
  const partLabel =
    section.partNumber != null ? `Part ${section.partNumber}` : style.label;

  return (
    <section
      id={section.id}
      className={`scroll-mt-28 overflow-hidden rounded-xl border transition-all duration-200 ${style.border} ${style.bg} ${
        open ? "shadow-sm" : "hover:border-neutral-950"
      } ${section.type === "part" ? "ring-1 ring-indigo-200/60" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        aria-expanded={open}
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[0.7rem] font-bold ${
            section.type === "part"
              ? "border border-indigo-300 bg-indigo-600 text-white"
              : section.type === "video"
                ? "border border-red-200 bg-red-600 text-white"
                : section.type === "hands-on"
                  ? "border border-emerald-300 bg-emerald-600 text-white"
                  : section.type === "intro"
                    ? "border border-neutral-300 bg-neutral-950 text-white"
                    : "border border-neutral-200 bg-white text-neutral-500"
          }`}
        >
          {section.partNumber ?? style.icon ?? String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`mb-1 block text-[0.65rem] font-semibold uppercase tracking-widest ${
              section.type === "part"
                ? "text-indigo-600"
                : section.type === "video"
                  ? "text-red-600"
                  : section.type === "hands-on"
                    ? "text-emerald-700"
                    : "text-neutral-400"
            }`}
          >
            {partLabel}
            {submoduleCount > 0 && (
              <span className="ml-2 normal-case tracking-normal text-neutral-500">
                · {submoduleCount} topics
              </span>
            )}
          </span>
          <span className="font-serif text-lg font-semibold leading-snug text-neutral-950 sm:text-xl">
            {section.title.replace(/^Part \d+\s*[—–-]\s*/i, "")}
          </span>
        </span>
        <span
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-transform duration-300 ${
            open ? "rotate-180 border-neutral-950 text-neutral-950" : ""
          }`}
        >
          ▾
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
              section.type === "part"
                ? "border-indigo-100 bg-white/70"
                : "border-neutral-100"
            }`}
          >
            {section.content ? (
              <MarkdownContent
                content={section.content}
                variant={section.type}
                sectionTitle={section.title}
              />
            ) : null}
            {section.submodules?.length ? (
              <SubmoduleGrid
                submodules={section.submodules}
                partNumber={section.partNumber}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export interface LessonTOCProps {
  groups: { label: string; items: { id: string; title: string; type: SectionType }[] }[];
  activeId: string | null;
  onJump: (id: string) => void;
}

export function LessonTOC({ groups, activeId, onJump }: LessonTOCProps) {
  return (
    <nav aria-label="Lesson sections">
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
        On this page
      </p>
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[0.6rem] font-bold uppercase tracking-wider text-neutral-400">
              {group.label.length > 36
                ? `${group.label.slice(0, 36)}…`
                : group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeId === item.id;
                const isSubmodule = item.type === "submodule";
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onJump(item.id)}
                      className={`w-full rounded-md py-1.5 text-left text-xs transition-all ${
                        isSubmodule ? "pl-5 pr-2" : "px-2"
                      } ${
                        active
                          ? "bg-neutral-950 font-medium text-white"
                          : "text-neutral-600 hover:bg-white hover:text-neutral-950"
                      }`}
                    >
                      <span className="line-clamp-2">{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function LessonTOCMobile({
  groups,
  activeId,
  onJump,
}: LessonTOCProps) {
  const flat = groups.flatMap((g) => g.items);
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {flat.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onJump(item.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
            activeId === item.id
              ? "border-neutral-950 bg-neutral-950 text-white"
              : "border-neutral-200 bg-white text-neutral-600"
          }`}
        >
          {item.title.length > 24 ? `${item.title.slice(0, 24)}…` : item.title}
        </button>
      ))}
    </div>
  );
}
