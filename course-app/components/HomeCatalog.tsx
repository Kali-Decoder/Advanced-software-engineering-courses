"use client";

import Link from "next/link";
import { COURSE_LIST } from "@/lib/course";
import {
  getCompletedModuleCount,
  getOverallPercent,
} from "@/lib/progress";
import { useProgressContext } from "@/context/ProgressContext";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { ProgressBar } from "./ProgressBar";
import { ProgressRing } from "./ProgressRing";

function CourseCard({
  meta,
}: {
  meta: (typeof COURSE_LIST)[number];
}) {
  const { getCourseProgress, hydrated } = useProgressContext();
  const state = getCourseProgress(meta.id);
  const percent = hydrated ? getOverallPercent(meta.id, state) : 0;
  const animatedPercent = useAnimatedNumber(percent);
  const completed = hydrated ? getCompletedModuleCount(meta.id, state) : 0;

  return (
    <Link
      href={`/courses/${meta.id}`}
      className="card-interactive group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-950"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
            {meta.institution}
          </p>
          <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-neutral-950 group-hover:underline md:text-2xl">
            {meta.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {meta.subtitle}
          </p>
        </div>
        <ProgressRing percent={animatedPercent} size={64} strokeWidth={3} />
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs text-neutral-500">
          <span>Progress</span>
          <span className="font-mono font-semibold text-neutral-950">
            {animatedPercent}%
          </span>
        </div>
        <ProgressBar percent={percent} shimmer={percent > 0} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500">
        <span>{meta.moduleCount} modules</span>
        <span>
          {completed} / {meta.moduleCount} completed
        </span>
      </div>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-950">
        {percent > 0 ? "Continue course" : "Start course"}
        <span className="transition group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

export function HomeCatalog() {
  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 animate-fade-up">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Course Platform
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">
          Choose a Course
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-500">
          Two structured engineering courses with full lesson content, checkpoints,
          and progress tracked separately for each course.
        </p>
      </header>

      <div className="grid gap-6 animate-fade-up stagger-1">
        {COURSE_LIST.map((meta) => (
          <CourseCard key={meta.id} meta={meta} />
        ))}
      </div>
    </div>
  );
}
