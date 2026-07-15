"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getCompletedCount,
  getOverallPercent,
  getTotalCheckpoints,
} from "@/lib/progress";
import { getBlogResources, hasBlogResources } from "@/lib/blog-resources";
import {
  getProjectCatalog,
  getProjectProgressSummary,
  hasProjects,
} from "@/lib/projects";
import { useCourseContext } from "@/context/CourseContext";
import { useCourseProgress } from "@/context/ProgressContext";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { BlogResourcesModal } from "./BlogResourcesModal";
import { ProjectsModal } from "./ProjectsModal";
import { Skeleton } from "./loading/Skeleton";
import { ProgressBar } from "./ProgressBar";
import { ProgressRing } from "./ProgressRing";

export function Header() {
  const { courseId, meta } = useCourseContext();
  const { state, hydrated } = useCourseProgress(courseId);
  const [blogOpen, setBlogOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const percent = hydrated ? getOverallPercent(courseId, state) : 0;
  const animatedPercent = useAnimatedNumber(percent);
  const done = hydrated ? getCompletedCount(courseId, state) : 0;
  const total = getTotalCheckpoints(courseId);
  const blogResources = getBlogResources(courseId);
  const showBlogResources = hasBlogResources(courseId);
  const projectCatalog = getProjectCatalog(courseId);
  const showProjects = hasProjects(courseId);
  const projectSummary = getProjectProgressSummary(courseId, state);

  return (
    <>
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
            {(showProjects || showBlogResources) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {showProjects && projectCatalog && (
                  <button
                    type="button"
                    onClick={() => setProjectsOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition hover:border-neutral-500 hover:bg-neutral-800"
                  >
                    <ProjectsIcon />
                    Projects
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                      {hydrated
                        ? `${projectSummary.completed}/${projectSummary.total}`
                        : projectSummary.total}
                    </span>
                  </button>
                )}
                {showBlogResources && (
                  <button
                    type="button"
                    onClick={() => setBlogOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition hover:border-neutral-500 hover:bg-neutral-800"
                  >
                    <BookIcon />
                    Blog Resources
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                      {blogResources.length}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 animate-fade-up stagger-2">
            {!hydrated ? (
              <div className="hidden min-w-[200px] sm:block">
                <Skeleton className="mb-2 h-3 w-20" variant="dark" />
                <Skeleton className="h-2 w-52" variant="dark" />
                <Skeleton className="mt-2 h-3 w-28" variant="dark" />
              </div>
            ) : (
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
            )}
            {!hydrated ? (
              <Skeleton className="h-[68px] w-[68px] rounded-full" variant="dark" />
            ) : (
              <ProgressRing percent={animatedPercent} size={68} strokeWidth={3} variant="dark" />
            )}
          </div>
        </div>
      </header>

      {showProjects && projectCatalog && (
        <ProjectsModal
          open={projectsOpen}
          onClose={() => setProjectsOpen(false)}
          catalog={projectCatalog}
        />
      )}

      {showBlogResources && (
        <BlogResourcesModal
          open={blogOpen}
          onClose={() => setBlogOpen(false)}
          resources={blogResources}
        />
      )}
    </>
  );
}

function ProjectsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 4.5h4v4h-4v-4ZM9.5 4.5h4v4h-4v-4ZM2.5 11.5h4v2h-4v-2ZM9.5 11.5h4v2h-4v-2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 3.5A1.5 1.5 0 0 1 4 2h4.5v12H4a1.5 1.5 0 0 1-1.5-1.5v-9ZM11.5 2H8v12h3.5A1.5 1.5 0 0 0 13 12.5v-9A1.5 1.5 0 0 0 11.5 2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}
