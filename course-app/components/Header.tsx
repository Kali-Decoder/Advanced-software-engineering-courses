"use client";

import Link from "next/link";
import {
  getCompletedCount,
  getOverallPercent,
  getTotalCheckpoints,
} from "@/lib/progress";
import { useCourseContext } from "@/context/CourseContext";
import { useCourseProgress } from "@/context/ProgressContext";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { ProgressBar } from "./ProgressBar";
import { ProgressRing } from "./ProgressRing";

export function Header() {
  const { courseId, meta } = useCourseContext();
  const { state, hydrated } = useCourseProgress(courseId);
  const percent = hydrated ? getOverallPercent(courseId, state) : 0;
  const animatedPercent = useAnimatedNumber(percent);
  const done = hydrated ? getCompletedCount(courseId, state) : 0;
  const total = getTotalCheckpoints(courseId);

  return (
    <header className="border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 py-6 lg:px-8">
        <div className="animate-fade-up">
          <Link
            href="/"
            className="mb-3 inline-block text-xs text-neutral-500 transition hover:text-neutral-300"
          >
            ← All courses
          </Link>
          <Link href={`/courses/${courseId}`} className="group block">
            <span className="mb-1 inline-block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-400 transition group-hover:text-white">
              {meta.institution}
            </span>
            <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-4xl">
              {meta.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-400 md:text-base">
              {meta.subtitle}
            </p>
          </Link>
        </div>

        <div className="flex items-center gap-5 animate-fade-up stagger-2">
          <div className="hidden min-w-[200px] sm:block">
            <div className="mb-2 flex items-baseline justify-between text-xs uppercase tracking-wider text-neutral-500">
              <span>Progress</span>
              <span className="font-mono text-lg font-semibold text-white">
                {animatedPercent}%
              </span>
            </div>
            <ProgressBar percent={percent} variant="dark" />
            <p className="mt-2 text-xs text-neutral-500">
              {done} / {total} checkpoints
            </p>
          </div>
          <ProgressRing percent={animatedPercent} size={68} strokeWidth={3} variant="dark" />
        </div>
      </div>
    </header>
  );
}
