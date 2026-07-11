import { notFound } from "next/navigation";
import { CourseShell } from "@/components/CourseShell";
import { ModuleView } from "@/components/ModuleView";
import { CourseProvider } from "@/context/CourseContext";
import {
  COURSES,
  getModule,
  isValidCourseId,
} from "@/lib/course";
import type { CourseId } from "@/lib/types";

export function generateStaticParams() {
  return Object.entries(COURSES).flatMap(([courseId, course]) =>
    course.modules.map((m) => ({
      courseId,
      id: String(m.id),
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string; id: string }>;
}) {
  const { courseId, id } = await params;
  if (!isValidCourseId(courseId)) return { title: "Module Not Found" };
  const module = getModule(courseId, parseInt(id, 10));
  if (!module) return { title: "Module Not Found" };
  return {
    title: `Module ${module.id}: ${module.title}`,
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ courseId: string; id: string }>;
}) {
  const { courseId, id } = await params;
  if (!isValidCourseId(courseId)) notFound();

  const moduleId = parseInt(id, 10);
  const module = getModule(courseId, moduleId);

  if (!module || Number.isNaN(moduleId)) {
    notFound();
  }

  return (
    <CourseProvider courseId={courseId as CourseId}>
      <CourseShell>
        <ModuleView module={module} />
      </CourseShell>
    </CourseProvider>
  );
}
