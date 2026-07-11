"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Module } from "@/lib/types";
import {
  getModuleProgress,
  markModuleComplete,
} from "@/lib/progress";
import {
  getNextModuleId,
  getPrevModuleId,
} from "@/lib/course";
import { extractMermaidBlocks } from "@/lib/parse-lesson";
import { useCourseContext } from "@/context/CourseContext";
import { useCourseProgress } from "@/context/ProgressContext";
import { CheckpointList } from "./CheckpointList";
import { Diagram } from "./Diagram";
import { LevelBadge } from "./LevelBadge";
import { LessonReader } from "./LessonReader";
import { MermaidDiagram } from "./MermaidDiagram";
import { ProgressBar } from "./ProgressBar";
import { ScrollProgress } from "./ScrollProgress";

type Tab = "lesson" | "diagram" | "checkpoint";

const TABS: { id: Tab; label: string }[] = [
  { id: "lesson", label: "Lesson" },
  { id: "diagram", label: "Diagram" },
  { id: "checkpoint", label: "Checkpoint" },
];

export function ModuleView({ module }: { module: Module }) {
  const { courseId } = useCourseContext();
  const { state, hydrated, persist } = useCourseProgress(courseId);
  const [activeTab, setActiveTab] = useState<Tab>("lesson");
  const [, setTick] = useState(0);
  const pct = hydrated ? getModuleProgress(module, state) : 0;

  const goToModule = (id: number) => {
    persist({ ...state, lastModule: id });
  };

  const completeCurrentAndGo = (targetId: number | "home") => {
    const next = markModuleComplete(module, state);
    if (targetId === "home") {
      persist(next);
    } else {
      persist({ ...next, lastModule: targetId });
    }
    setTick((t) => t + 1);
  };

  const prev = getPrevModuleId(courseId, module.id);
  const next = getNextModuleId(courseId, module.id);
  const mermaidCharts = useMemo(
    () => extractMermaidBlocks(module.content),
    [module.content]
  );

  return (
    <>
      <ScrollProgress />
      <div className="animate-fade-in min-w-0 max-w-full">
        <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="transition hover:text-neutral-950">
            All Courses
          </Link>
          <span>/</span>
          <Link
            href={`/courses/${courseId}`}
            className="transition hover:text-neutral-950"
          >
            Course Home
          </Link>
          <span>/</span>
          <span className="text-neutral-950">Module {module.id}</span>
        </nav>

        <header className="mb-8 border-b border-neutral-200 pb-8 animate-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <LevelBadge level={module.level} />
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
                {module.title}
              </h2>
              <p className="mt-2 max-w-2xl text-neutral-500">{module.description}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-3 text-center">
              <p className="font-mono text-2xl font-bold text-neutral-950">{pct}%</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-neutral-400">
                complete
              </p>
            </div>
          </div>
          <ProgressBar percent={pct} shimmer={pct > 0} className="mt-5" />
        </header>

        <div className="mb-8 flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "tab-active shadow-sm"
                  : "text-neutral-500 hover:bg-white hover:text-neutral-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid w-full min-w-0">
          <article
            className={`col-start-1 row-start-1 w-full min-w-0 ${
              activeTab !== "lesson"
                ? "invisible pointer-events-none"
                : "relative z-10"
            }`}
            aria-hidden={activeTab !== "lesson"}
          >
            <LessonReader content={module.content} />
          </article>

          <article
            className={`col-start-1 row-start-1 w-full min-w-0 rounded-xl border border-neutral-200 bg-white p-6 lg:p-8 ${
              activeTab !== "diagram"
                ? "invisible pointer-events-none"
                : "relative z-10"
            }`}
            aria-hidden={activeTab !== "diagram"}
          >
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-neutral-400">
              {mermaidCharts.length ? "Architecture Diagrams" : "Concept Diagram"}
            </h3>
            <div className="w-full min-w-0 max-w-full space-y-6 overflow-hidden">
              {mermaidCharts.length > 0 ? (
                mermaidCharts.map((chart, i) => (
                  <MermaidDiagram
                    key={i}
                    chart={chart}
                    title={
                      mermaidCharts.length > 1
                        ? `Diagram ${i + 1} of ${mermaidCharts.length}`
                        : module.title
                    }
                  />
                ))
              ) : (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-6">
                  <Diagram name={module.diagram} />
                </div>
              )}
            </div>
          </article>

          <article
            className={`col-start-1 row-start-1 w-full min-w-0 rounded-xl border border-neutral-200 bg-white p-6 lg:p-8 ${
              activeTab !== "checkpoint"
                ? "invisible pointer-events-none"
                : "relative z-10"
            }`}
            aria-hidden={activeTab !== "checkpoint"}
          >
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Checkpoint
            </h3>
            <CheckpointList
              module={module}
              onUpdate={() => setTick((t) => t + 1)}
            />
          </article>
        </div>

        <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-8">
          {prev !== null ? (
            <Link
              href={`/courses/${courseId}/modules/${prev}`}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:border-neutral-950"
              onClick={() => goToModule(prev)}
            >
              ← Module {prev}
            </Link>
          ) : (
            <span />
          )}
          {next !== null ? (
            <Link
              href={`/courses/${courseId}/modules/${next}`}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              onClick={() => completeCurrentAndGo(next)}
            >
              Module {next} →
            </Link>
          ) : (
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-950 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              onClick={() => completeCurrentAndGo("home")}
            >
              Finish Course →
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
