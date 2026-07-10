export type SectionType = "intro" | "concept" | "hands-on" | "checkpoint";

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  type: SectionType;
}

function slugify(text: string, index: number) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base ? `${base}-${index}` : `section-${index}`;
}

function detectType(title: string): SectionType {
  const t = title.toLowerCase();
  if (t.includes("hands-on") || t.includes("exercise")) return "hands-on";
  if (t.includes("checkpoint")) return "checkpoint";
  return "concept";
}

export function parseLessonSections(raw: string): LessonSection[] {
  const cleaned = raw.replace(/\n---\s*$/m, "").trim();
  const chunks = cleaned.split(/^### /m);
  const sections: LessonSection[] = [];

  chunks.forEach((chunk, index) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    const newline = trimmed.indexOf("\n");
    if (index === 0 && !cleaned.startsWith("### ")) {
      sections.push({
        id: slugify("introduction", 0),
        title: "Overview",
        content: trimmed,
        type: "intro",
      });
      return;
    }

    const title =
      newline === -1 ? trimmed : trimmed.slice(0, newline).trim();
    const content = newline === -1 ? "" : trimmed.slice(newline + 1).trim();

    sections.push({
      id: slugify(title, index),
      title,
      content,
      type: detectType(title),
    });
  });

  return sections;
}

export function estimateReadingMinutes(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
