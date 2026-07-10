"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COURSE, finalChecklistId } from "@/lib/course";
import { getModuleProgress, isModuleComplete } from "@/lib/progress";
import { useProgressContext } from "@/context/ProgressContext";
import { AnimatedCheckbox } from "./AnimatedCheckbox";
import { ProgressBar } from "./ProgressBar";
import { SidebarToggle } from "./SidebarToggle";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { state, hydrated, persist } = useProgressContext();
  const [query, setQuery] = useState("");

  const activeId = pathname.startsWith("/modules/")
    ? parseInt(pathname.split("/")[2], 10)
    : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COURSE.modules;
    return COURSE.modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.level.toLowerCase().includes(q) ||
        String(m.id).includes(q)
    );
  }, [query]);

  return (
    <aside className="flex h-full flex-col bg-neutral-50">
      <div
        className={`sidebar-top flex shrink-0 items-center border-b border-neutral-200 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          collapsed ? "justify-center px-2 py-3" : "justify-between gap-3 px-4 py-3"
        }`}
      >
        <div
          className={`sidebar-top-label min-w-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            collapsed
              ? "max-w-0 opacity-0"
              : "max-w-full flex-1 opacity-100"
          }`}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
            Course modules
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-neutral-950">
            {COURSE.modules.length} lessons
          </p>
        </div>
        <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
      </div>

      <div
        className={`sidebar-search grid shrink-0 border-b border-neutral-200 transition-[grid-template-rows,opacity,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          collapsed
            ? "grid-rows-[0fr] border-b-0 opacity-0"
            : "grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Search modules…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                tabIndex={collapsed ? -1 : 0}
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <ul>
          {filtered.map((module) => {
            const complete = hydrated && isModuleComplete(module, state);
            const pct = hydrated ? getModuleProgress(module, state) : 0;
            const isActive = activeId === module.id;

            return (
              <li key={module.id}>
                <Link
                  href={`/modules/${module.id}`}
                  title={collapsed ? `Module ${module.id}: ${module.title}` : undefined}
                  className={`sidebar-nav-link group mx-2 my-0.5 flex items-center rounded-lg text-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-white hover:text-neutral-950"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      complete
                        ? "bg-neutral-950 text-white"
                        : isActive
                          ? "bg-white text-neutral-950"
                          : "border border-neutral-200 bg-white text-neutral-950"
                    } ${collapsed ? "group-hover:scale-105" : ""}`}
                  >
                    {complete ? "✓" : module.id}
                  </span>
                  <span
                    className={`sidebar-item-text min-w-0 flex-1 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      collapsed
                        ? "max-w-0 translate-x-2 opacity-0"
                        : "max-w-full translate-x-0 opacity-100"
                    }`}
                  >
                    <span className="block truncate font-medium">{module.title}</span>
                    <ProgressBar
                      percent={pct}
                      size="small"
                      variant={isActive ? "dark" : "light"}
                      className="mt-1.5"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section
        className={`sidebar-checklist grid shrink-0 border-t border-neutral-200 transition-[grid-template-rows,opacity,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          collapsed
            ? "grid-rows-[0fr] border-t-0 opacity-0"
            : "grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4">
            <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
              Final Checklist
            </h3>
            <ul className="max-h-40 space-y-2 overflow-y-auto">
              {COURSE.completionChecklist.map((item, i) => {
                const id = finalChecklistId(i);
                const checked = hydrated && state.completionChecklist[id];
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-start gap-2.5 text-xs text-neutral-600">
                      <AnimatedCheckbox
                        size="sm"
                        checked={!!checked}
                        onChange={(val) => {
                          persist({
                            ...state,
                            completionChecklist: {
                              ...state.completionChecklist,
                              [id]: val,
                            },
                          });
                        }}
                      />
                      <span
                        className={`leading-relaxed transition-all duration-300 ${
                          checked ? "text-neutral-400 line-through" : ""
                        }`}
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </aside>
  );
}
