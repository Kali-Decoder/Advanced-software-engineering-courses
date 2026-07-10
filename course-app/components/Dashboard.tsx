"use client";

import Link from "next/link";
import {
  COURSE,
  COURSE_META,
  LEVEL_ORDER,
  getModule,
} from "@/lib/course";
import {
  getLevelProgress,
  getModuleProgress,
  isModuleComplete,
} from "@/lib/progress";
import { useProgressContext } from "@/context/ProgressContext";
import { Diagram } from "./Diagram";
import { LevelBadge } from "./LevelBadge";
import { ProgressBar } from "./ProgressBar";

export function Dashboard() {
  const { state, hydrated } = useProgressContext();

  const levels = LEVEL_ORDER.map((level) => ({
    level,
    modules: COURSE.modules.filter((m) => m.level === level),
    progress: hydrated ? getLevelProgress(level, state) : 0,
  })).filter((l) => l.modules.length > 0);

  const completedModules = hydrated
    ? COURSE.modules.filter((m) => isModuleComplete(m, state)).length
    : 0;

  const resumeId =
    state.lastModule ?? COURSE.modules.find((m) => !isModuleComplete(m, state))?.id ?? 0;
  const resumeModule = getModule(resumeId);

  return (
    <div className="animate-fade-in">
      {resumeModule && hydrated && (
        <Link
          href={`/modules/${resumeId}`}
          className="card-interactive mb-10 flex items-center justify-between gap-4 rounded-xl border border-neutral-950 bg-neutral-950 p-6 text-white"
        >
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
              Continue Learning
            </p>
            <p className="mt-2 font-serif text-xl font-semibold">
              Module {resumeModule.id}: {resumeModule.title}
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              {getModuleProgress(resumeModule, state)}% complete
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-xl">
            →
          </span>
        </Link>
      )}

      <section className="mb-10 animate-fade-up stagger-1">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">
          Welcome to the Course
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-500">
          A structured 14-module course on agentic memory — from embeddings and
          RAG through memory operations, graphs, hybrid retrieval, and a
          hands-on capstone build.
        </p>
      </section>

      <div className="mb-10 grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3 animate-fade-up stagger-2">
        {[
          { label: "Modules", value: "14", sub: "0–13 structured" },
          {
            label: "Completed",
            value: String(completedModules),
            sub: `of ${COURSE.modules.length} modules`,
          },
          { label: "Duration", value: "10–12", sub: "weeks suggested" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
              {stat.label}
            </p>
            <p className="mt-2 font-mono text-4xl font-bold text-neutral-950">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-neutral-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-2 animate-fade-up stagger-3">
        {[
          { title: "Course Format", content: COURSE_META.format },
          {
            title: "Prerequisites",
            content: (
              <ul className="space-y-2">
                {COURSE_META.prerequisites.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-neutral-600">
                    <span className="mt-2 h-px w-3 shrink-0 bg-neutral-950" />
                    {p}
                  </li>
                ))}
              </ul>
            ),
          },
          { title: "Suggested Pace", content: COURSE_META.pace },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-neutral-200 bg-white p-6"
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">
              {card.title}
            </h3>
            {typeof card.content === "string" ? (
              <p className="text-neutral-600 leading-relaxed">{card.content}</p>
            ) : (
              card.content
            )}
          </article>
        ))}
        <article className="rounded-xl border border-neutral-200 bg-white p-6 md:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Learning Path
          </h3>
          <Diagram name="learning-path" />
        </article>
      </div>

      <section className="animate-fade-up stagger-4">
        <h3 className="mb-4 font-serif text-xl font-semibold text-neutral-950">
          Explore by Level
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map(({ level, modules, progress }) => (
            <Link
              key={level}
              href={`/modules/${modules[0].id}`}
              className="card-interactive rounded-xl border border-neutral-200 bg-white p-5"
            >
              <LevelBadge level={modules[0].level} />
              <h4 className="mt-3 font-serif text-lg font-semibold text-neutral-950">
                {level}
              </h4>
              <p className="mt-1 text-sm text-neutral-500">
                {modules.length} modules · {modules.map((m) => m.id).join(", ")}
              </p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-neutral-500">
                  <span>Progress</span>
                  <span className="font-mono font-semibold text-neutral-950">
                    {progress}%
                  </span>
                </div>
                <ProgressBar percent={progress} size="small" shimmer={progress > 0} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 animate-fade-up stagger-5">
        <h3 className="mb-4 font-serif text-xl font-semibold text-neutral-950">
          All Modules
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {COURSE.modules.map((m) => {
            const pct = hydrated ? getModuleProgress(m, state) : 0;
            const done = hydrated && isModuleComplete(m, state);
            return (
              <Link
                key={m.id}
                href={`/modules/${m.id}`}
                className="card-interactive group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    done
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 text-neutral-950"
                  }`}
                >
                  {done ? "✓" : m.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-950">
                    {m.title}
                  </p>
                  <ProgressBar percent={pct} size="small" className="mt-2" />
                </div>
                <span className="text-neutral-300 transition group-hover:text-neutral-950">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
