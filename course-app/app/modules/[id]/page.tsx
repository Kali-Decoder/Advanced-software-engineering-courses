import { redirect } from "next/navigation";

export default async function LegacyModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/courses/agentic-memory/modules/${id}`);
}
