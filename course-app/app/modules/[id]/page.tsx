import { notFound } from "next/navigation";
import { CourseShell } from "@/components/CourseShell";
import { ModuleView } from "@/components/ModuleView";
import { COURSE, getModule } from "@/lib/course";

export function generateStaticParams() {
  return COURSE.modules.map((m) => ({ id: String(m.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const module = getModule(parseInt(id, 10));
  if (!module) return { title: "Module Not Found" };
  return {
    title: `Module ${module.id}: ${module.title}`,
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const moduleId = parseInt(id, 10);
  const module = getModule(moduleId);

  if (!module || Number.isNaN(moduleId)) {
    notFound();
  }

  return (
    <CourseShell>
      <ModuleView module={module} />
    </CourseShell>
  );
}
