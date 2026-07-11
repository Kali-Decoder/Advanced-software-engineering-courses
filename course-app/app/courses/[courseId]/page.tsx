import { notFound } from "next/navigation";
import { CourseShell } from "@/components/CourseShell";
import { Dashboard } from "@/components/Dashboard";
import { CourseProvider } from "@/context/CourseContext";
import {
  COURSES,
  getCourseMeta,
  isValidCourseId,
} from "@/lib/course";
import type { CourseId } from "@/lib/types";

export function generateStaticParams() {
  return Object.keys(COURSES).map((courseId) => ({ courseId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (!isValidCourseId(courseId)) return { title: "Course Not Found" };
  const meta = getCourseMeta(courseId);
  return {
    title: `${meta.title} — Course Home`,
    description: meta.subtitle,
  };
}

export default async function CourseHomePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (!isValidCourseId(courseId)) notFound();

  return (
    <CourseProvider courseId={courseId as CourseId}>
      <CourseShell>
        <Dashboard />
      </CourseShell>
    </CourseProvider>
  );
}
