"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getProjectProgressSummary,
  getProjectStatus,
  setProjectStatus,
  type Project,
  type ProjectCatalog,
} from "@/lib/projects";
import type { ProgressState, ProjectStatus } from "@/lib/types";
import { useCourseContext } from "@/context/CourseContext";
import { useCourseProgress } from "@/context/ProgressContext";
import { ProgressBar } from "./ProgressBar";

interface ProjectsModalProps {
  open: boolean;
  onClose: () => void;
  catalog: ProjectCatalog;
}

type TierFilter = "all" | number;
type StatusFilter = "all" | ProjectStatus;

const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function ProjectsModal({ open, onClose, catalog }: ProjectsModalProps) {
  const { courseId } = useCourseContext();
  const { state, persist, hydrated } = useCourseProgress(courseId);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const summary = useMemo(
    () => getProjectProgressSummary(courseId, state),
    [courseId, state]
  );

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setTierFilter("all");
      setStatusFilter("all");
      setExpandedId(null);
    }
  }, [open]);

  const tierById = useMemo(() => {
    const map = new Map(catalog.tiers.map((tier) => [tier.id, tier]));
    return map;
  }, [catalog.tiers]);

  const projectById = useMemo(() => {
    const map = new Map(catalog.projects.map((project) => [project.id, project]));
    return map;
  }, [catalog.projects]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog.projects.filter((project) => {
      if (tierFilter !== "all" && project.tier !== tierFilter) return false;
      const status = getProjectStatus(project.id, state);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!normalized) return true;
      const haystack = [
        project.title,
        project.inspiredBy,
        project.description,
        ...project.technologies,
        ...project.keyLearnings,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [catalog.projects, query, tierFilter, statusFilter, state]);

  const suggestedProjects = useMemo(
    () =>
      catalog.suggestedPath
        .map((id) => projectById.get(id))
        .filter((project): project is Project => Boolean(project)),
    [catalog.suggestedPath, projectById]
  );

  const updateStatus = (projectId: number, status: ProjectStatus) => {
    persist(setProjectStatus(state, projectId, status));
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Hands-on projects"
      onClick={onClose}
    >
      <div
        className="relative mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
                Build real systems
              </p>
              <h2 className="font-serif text-xl font-bold text-neutral-950 sm:text-2xl">
                Hands-on Projects
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                {catalog.projects.length} production-inspired projects, ordered
                from foundations to expert level.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close projects"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 transition hover:border-neutral-300 hover:bg-white hover:text-neutral-950"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
                  Your progress
                </p>
                <p className="mt-1 font-mono text-lg font-semibold text-neutral-950">
                  {hydrated ? summary.completed : "–"} / {summary.total}{" "}
                  <span className="text-sm font-medium text-neutral-500">
                    completed
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                <span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {hydrated ? summary.inProgress : "–"}
                  </span>{" "}
                  in progress
                </span>
                <span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {hydrated ? summary.notStarted : "–"}
                  </span>{" "}
                  not started
                </span>
                <span className="font-mono font-semibold text-neutral-950">
                  {hydrated ? summary.percent : 0}%
                </span>
              </div>
            </div>
            <ProgressBar
              percent={hydrated ? summary.percent : 0}
              size="small"
              className="mt-3"
              shimmer={summary.percent > 0}
            />
          </div>

          <label className="mt-4 block">
            <span className="sr-only">Search projects</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, tech, or concept…"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            />
          </label>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <TierChip
              active={tierFilter === "all"}
              onClick={() => setTierFilter("all")}
              label="All tiers"
              count={catalog.projects.length}
            />
            {catalog.tiers.map((tier) => (
              <TierChip
                key={tier.id}
                active={tierFilter === tier.id}
                onClick={() => setTierFilter(tier.id)}
                label={`T${tier.id} · ${tier.label}`}
                count={
                  catalog.projects.filter((project) => project.tier === tier.id)
                    .length
                }
              />
            ))}
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <TierChip
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label="All status"
              count={summary.total}
            />
            <TierChip
              active={statusFilter === "not_started"}
              onClick={() => setStatusFilter("not_started")}
              label="Not started"
              count={summary.notStarted}
            />
            <TierChip
              active={statusFilter === "in_progress"}
              onClick={() => setStatusFilter("in_progress")}
              label="In progress"
              count={summary.inProgress}
            />
            <TierChip
              active={statusFilter === "completed"}
              onClick={() => setStatusFilter("completed")}
              label="Completed"
              count={summary.completed}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {tierFilter === "all" &&
            statusFilter === "all" &&
            !query.trim() && (
              <SuggestedPath
                projects={suggestedProjects}
                state={state}
              />
            )}

          {filtered.length === 0 ? (
            <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
              No projects match your filters.
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((project) => {
                const tier = tierById.get(project.tier);
                const expanded = expandedId === project.id;
                const status = getProjectStatus(project.id, state);
                return (
                  <li key={project.id}>
                    <article
                      className={`overflow-hidden rounded-xl border transition ${
                        status === "completed"
                          ? "border-neutral-950 bg-neutral-50"
                          : expanded
                            ? "border-neutral-950 bg-white shadow-sm"
                            : "border-neutral-200 bg-white hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expanded ? null : project.id)
                          }
                          className="flex min-w-0 flex-1 items-start gap-3 text-left sm:gap-4"
                          aria-expanded={expanded}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold ${
                              status === "completed"
                                ? "bg-neutral-950 text-white"
                                : status === "in_progress"
                                  ? "border border-neutral-950 bg-white text-neutral-950"
                                  : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {status === "completed" ? (
                              <CheckIcon />
                            ) : (
                              String(project.id).padStart(2, "0")
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`font-serif text-lg font-bold ${
                                  status === "completed"
                                    ? "text-neutral-500"
                                    : "text-neutral-950"
                                }`}
                              >
                                {project.title}
                              </h3>
                              {tier && (
                                <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-neutral-500">
                                  Tier {tier.id}
                                </span>
                              )}
                              <StatusBadge status={status} />
                            </div>
                            <p className="mt-0.5 text-sm text-neutral-500">
                              like {project.inspiredBy}
                            </p>
                            {!expanded && (
                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                                {project.description}
                              </p>
                            )}
                          </div>
                          <ChevronIcon expanded={expanded} />
                        </button>
                      </div>

                      {expanded && (
                        <div className="border-t border-neutral-100 px-4 pb-5 pt-4 sm:px-5 sm:pl-[4.75rem]">
                          <p className="text-sm leading-relaxed text-neutral-700">
                            {project.description}
                          </p>

                          <div className="mt-4">
                            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
                              Status
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(
                                [
                                  "not_started",
                                  "in_progress",
                                  "completed",
                                ] as ProjectStatus[]
                              ).map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() =>
                                    updateStatus(project.id, option)
                                  }
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                    status === option
                                      ? "border-neutral-950 bg-neutral-950 text-white"
                                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-950"
                                  }`}
                                >
                                  {STATUS_LABELS[option]}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div>
                              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
                                Technologies
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {project.technologies.map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
                                Key learnings
                              </p>
                              <ul className="space-y-1.5">
                                {project.keyLearnings.map((learning) => (
                                  <li
                                    key={learning}
                                    className="flex gap-2 text-sm text-neutral-700"
                                  >
                                    <span
                                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-950"
                                      aria-hidden="true"
                                    />
                                    <span>{learning}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function SuggestedPath({
  projects,
  state,
}: {
  projects: Project[];
  state: ProgressState;
}) {
  if (projects.length === 0) return null;

  return (
    <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
        Suggested learning path
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        A focused route from &ldquo;can build a normal backend&rdquo; to
        understanding the internals of Kafka, etcd, and Redis Cluster.
      </p>
      <ol className="mt-3 flex flex-wrap items-center gap-2">
        {projects.map((project, index) => {
          const status = getProjectStatus(project.id, state);
          return (
            <li key={project.id} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                  status === "completed"
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : status === "in_progress"
                      ? "border-neutral-950 bg-white text-neutral-950"
                      : "border-neutral-300 bg-white text-neutral-800"
                }`}
              >
                <span className="font-mono text-neutral-400">
                  #{project.id}
                </span>
                {project.title}
              </span>
              {index < projects.length - 1 && (
                <span className="text-neutral-300" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles = {
    not_started: "border-neutral-200 bg-white text-neutral-500",
    in_progress: "border-neutral-400 bg-white text-neutral-800",
    completed: "border-neutral-950 bg-neutral-950 text-white",
  }[status];

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${styles}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function TierChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-950"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[0.65rem] ${
          active
            ? "bg-white/15 text-neutral-200"
            : "bg-neutral-100 text-neutral-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`mt-1.5 shrink-0 text-neutral-400 transition ${
        expanded ? "rotate-180" : ""
      }`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2l10 10M12 2 2 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
