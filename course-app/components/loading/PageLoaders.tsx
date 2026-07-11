import { LoadingSpinner } from "./LoadingSpinner";
import { Skeleton } from "./Skeleton";

function DarkHeaderSkeleton() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 py-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-3 h-3 w-24" variant="dark" />
          <Skeleton className="mb-2 h-3 w-40" variant="dark" />
          <Skeleton className="h-9 w-full max-w-lg" variant="dark" />
          <Skeleton className="mt-3 h-4 w-full max-w-md" variant="dark" />
          <Skeleton className="mt-4 h-9 w-36" variant="dark" />
        </div>
        <div className="hidden sm:block">
          <Skeleton className="mb-2 h-3 w-20" variant="dark" />
          <Skeleton className="h-2 w-52" variant="dark" />
          <Skeleton className="mt-2 h-3 w-28" variant="dark" />
        </div>
        <Skeleton className="h-[68px] w-[68px] rounded-full" variant="dark" />
      </div>
    </header>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-neutral-50 lg:block">
      <div className="border-b border-neutral-200 px-4 py-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-4 w-20" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-1.5 w-full" />
          </div>
        ))}
      </div>
    </aside>
  );
}

export function HomePageLoader() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-in px-4 py-10 sm:px-8 sm:py-14">
      <div className="mb-10">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-10 w-full max-w-md" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-3 h-7 w-full max-w-lg" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-6 h-2 w-full" />
            <Skeleton className="mt-4 h-3 w-40" />
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <LoadingSpinner label="Loading courses…" />
      </div>
    </div>
  );
}

export function CourseShellLoader({ variant = "dashboard" }: { variant?: "dashboard" | "module" }) {
  return (
    <>
      <DarkHeaderSkeleton />
      <div className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-1 bg-white">
        <SidebarSkeleton />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
          {variant === "module" ? <ModuleContentLoader /> : <DashboardContentLoader />}
        </main>
      </div>
    </>
  );
}

function DashboardContentLoader() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-64" />
      <div>
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-5 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        ))}
      </div>
      <LoadingSpinner label="Loading course home…" />
    </div>
  );
}

export function ModuleContentLoader() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-72" />
      <div className="border-b border-neutral-200 pb-8">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="mt-4 h-10 w-full max-w-2xl" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-5 h-2 w-full" />
      </div>
      <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 p-5">
            <div className="flex gap-4">
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-6 w-full max-w-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <LoadingSpinner label="Loading lesson content…" />
    </div>
  );
}

export function LessonReaderLoader() {
  return (
    <div className="lesson-reader animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex-1 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 p-5">
              <div className="flex gap-4">
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-full max-w-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
