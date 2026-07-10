"use client";

import { useProgressContext } from "@/context/ProgressContext";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function CourseShell({ children }: { children: React.ReactNode }) {
  const { reset } = useProgressContext();
  const { collapsed, toggle, hydrated } = useSidebarCollapsed();

  return (
    <>
      <Header />
      <MobileNav />
      <div className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-1 bg-white lg:gap-0">
        <div
          className={`sidebar-shell relative hidden shrink-0 border-r border-neutral-200 bg-neutral-50 lg:block ${
            hydrated
              ? collapsed
                ? "sidebar-shell-collapsed"
                : "sidebar-shell-expanded"
              : "sidebar-shell-expanded"
          }`}
        >
          <div className="sticky top-0 h-screen overflow-hidden">
            <Sidebar
              collapsed={hydrated && collapsed}
              onToggle={toggle}
            />
          </div>
        </div>
        <main className="main-content min-w-0 max-w-full flex-1 overflow-x-hidden bg-white px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
      <footer className="border-t border-neutral-200 bg-neutral-950 py-6 text-center text-sm text-neutral-400">
        <p className="font-medium text-white">AI Agent Memory Systems</p>
        <p className="mt-2 text-xs">
          Progress saved locally ·{" "}
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all course progress? This cannot be undone.")) {
                reset();
                window.location.reload();
              }
            }}
            className="text-neutral-300 underline underline-offset-2 transition hover:text-white"
          >
            Reset progress
          </button>
        </p>
      </footer>
    </>
  );
}
