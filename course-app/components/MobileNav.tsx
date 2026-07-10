"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { COURSE } from "@/lib/course";
import { getModuleProgress, isModuleComplete } from "@/lib/progress";
import { useProgressContext } from "@/context/ProgressContext";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, hydrated } = useProgressContext();

  const activeId = pathname.startsWith("/modules/")
    ? pathname.split("/")[2]
    : "home";

  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
      <select
        value={activeId}
        onChange={(e) => {
          const val = e.target.value;
          router.push(val === "home" ? "/" : `/modules/${val}`);
        }}
        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950"
      >
        <option value="home">Course Home</option>
        {COURSE.modules.map((m) => {
          const done = hydrated && isModuleComplete(m, state);
          const pct = hydrated ? getModuleProgress(m, state) : 0;
          return (
            <option key={m.id} value={m.id}>
              {done ? "✓" : "○"} Module {m.id}: {m.title} ({pct}%)
            </option>
          );
        })}
      </select>
    </div>
  );
}
