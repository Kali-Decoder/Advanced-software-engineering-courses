import type { CourseLevel } from "@/lib/types";

export function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <span className="inline-block rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-600">
      {level}
    </span>
  );
}
