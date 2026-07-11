"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  countLessonSections,
  countParts,
  estimateReadingMinutes,
  groupSectionsForTOC,
  parseLessonSections,
} from "@/lib/parse-lesson";
import {
  LessonSectionCard,
  LessonTOC,
  LessonTOCMobile,
} from "./LessonSection";

interface LessonReaderProps {
  content: string;
}

export function LessonReader({ content }: LessonReaderProps) {
  const sections = useMemo(() => parseLessonSections(content), [content]);
  const tocGroups = useMemo(() => groupSectionsForTOC(sections), [sections]);
  const totalSections = useMemo(
    () => countLessonSections(sections),
    [sections]
  );
  const partCount = useMemo(() => countParts(sections), [sections]);
  const readingMinutes = useMemo(
    () => estimateReadingMinutes(content),
    [content]
  );

  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const first = sections[0]?.id;
    return new Set(first ? [first] : []);
  });
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null
  );

  useEffect(() => {
    const defaultOpen = sections
      .filter((s) => s.type === "intro" || s.type === "part")
      .slice(0, 2)
      .map((s) => s.id);
    const first = sections[0]?.id;
    const ids = defaultOpen.length ? defaultOpen : first ? [first] : [];
    setOpenIds(new Set(ids));
    setActiveId(first ?? null);
  }, [sections]);

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveId(id);
  }, []);

  const jumpTo = useCallback(
    (id: string) => {
      const parent = sections.find((s) =>
        s.submodules?.some((sub) => sub.id === id)
      );
      if (parent) {
        setOpenIds((prev) => new Set(prev).add(parent.id));
      } else {
        setOpenIds((prev) => new Set(prev).add(id));
      }
      setActiveId(id);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },
    [sections]
  );

  const expandAll = () => setOpenIds(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setOpenIds(new Set());

  const openedCount = sections.filter((s) => openIds.has(s.id)).length;

  const tocGroupsForNav = useMemo(
    () =>
      tocGroups.map((g) => ({
        label: g.label,
        items: g.items.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
        })),
      })),
    [tocGroups]
  );

  return (
    <div className="lesson-reader">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-5">
        <div className="text-sm text-neutral-600">
          {partCount > 0 && (
            <>
              <span className="font-medium text-indigo-600">
                {partCount} parts
              </span>
              <span className="mx-2 text-neutral-300">·</span>
            </>
          )}
          <span className="font-medium text-neutral-950">
            {totalSections} sections
          </span>
          <span className="mx-2 text-neutral-300">·</span>
          <span>~{readingMinutes} min</span>
          <span className="mx-2 text-neutral-300">·</span>
          <span>{openedCount} open</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-950 transition hover:border-neutral-950"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            Collapse
          </button>
        </div>
      </div>

      <LessonTOCMobile
        groups={tocGroupsForNav}
        activeId={activeId}
        onJump={jumpTo}
      />

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <LessonTOC
              groups={tocGroupsForNav}
              activeId={activeId}
              onJump={jumpTo}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {sections.map((section, index) => (
            <LessonSectionCard
              key={section.id}
              section={section}
              index={index}
              open={openIds.has(section.id)}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
