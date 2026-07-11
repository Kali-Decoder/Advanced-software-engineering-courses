export type SectionType =
  | "intro"
  | "concept"
  | "example"
  | "diagram"
  | "video"
  | "hands-on"
  | "checkpoint"
  | "deep-dive"
  | "part"
  | "submodule";

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  type: SectionType;
  submodules?: LessonSection[];
  partNumber?: number;
}

function slugify(text: string, index: number) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base ? `${base}-${index}` : `section-${index}`;
}

function parsePartNumber(title: string): number | undefined {
  const match = title.match(/^Part\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function detectType(title: string): SectionType {
  const t = title.toLowerCase();
  if (t.includes("module overview") || t === "overview") return "intro";
  if (t.includes("simple explanation") || t.includes("getting started")) {
    return "intro";
  }
  if (t.includes("real-life example") || t.includes("real life example")) {
    return "example";
  }
  if (t.startsWith("diagram") || t.includes("request flow")) return "diagram";
  if (t.includes("video tutorial") || t.includes("🎥")) return "video";
  if (
    t.includes("hands-on") ||
    t.includes("🛠️") ||
    t.includes("exercise")
  ) {
    return "hands-on";
  }
  if (
    t.includes("key word") ||
    t.includes("quick reference") ||
    t.includes("checklist")
  ) {
    return "checkpoint";
  }
  if (/^part\s+\d+/i.test(title)) return "part";
  if (
    t.includes("networking fundamentals") ||
    t.includes("deep dive") ||
    t.includes("fundamentals for software")
  ) {
    return "deep-dive";
  }
  return "concept";
}

function parseSubmodules(
  content: string,
  baseIndex: number
): { intro: string; submodules: LessonSection[] } {
  if (!/^#### /m.test(content)) {
    return { intro: content, submodules: [] };
  }

  const parts = content.split(/^#### /m);
  const intro = parts[0]?.trim() ?? "";
  const submodules = parts.slice(1).map((chunk, i) => {
    const newline = chunk.indexOf("\n");
    const title = newline === -1 ? chunk.trim() : chunk.slice(0, newline).trim();
    const subContent = newline === -1 ? "" : chunk.slice(newline + 1).trim();

    return {
      id: slugify(`sub-${title}`, baseIndex * 100 + i),
      title,
      content: subContent,
      type: "submodule" as SectionType,
    };
  });

  return { intro, submodules };
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
    const rawContent = newline === -1 ? "" : trimmed.slice(newline + 1).trim();
    const { intro, submodules } = parseSubmodules(rawContent, index);
    const sectionType = detectType(title);
    const partNumber = parsePartNumber(title);

    sections.push({
      id: slugify(title, index),
      title: title.replace(/^🎥\s*|^🛠️\s*/u, "").trim(),
      content: submodules.length ? intro : rawContent,
      type: submodules.length && sectionType !== "part" ? "deep-dive" : sectionType,
      submodules: submodules.length ? submodules : undefined,
      partNumber,
    });
  });

  return sections;
}

export interface TocGroup {
  label: string;
  items: LessonSection[];
}

/** TOC with part groups for structured modules */
export function groupSectionsForTOC(
  sections: LessonSection[]
): TocGroup[] {
  const groups: TocGroup[] = [];
  let current: TocGroup | null = null;

  for (const section of sections) {
    if (section.type === "part" || section.type === "intro") {
      if (current) groups.push(current);
      current = {
        label: section.title,
        items: [section],
      };
      if (section.submodules?.length) {
        current.items.push(...section.submodules);
      }
    } else if (section.type === "video" || section.type === "hands-on") {
      if (current) groups.push(current);
      current = null;
      groups.push({ label: section.title, items: [section] });
    } else {
      if (!current) {
        current = { label: "Sections", items: [] };
      }
      current.items.push(section);
      if (section.submodules?.length) {
        current.items.push(...section.submodules);
      }
    }
  }

  if (current) groups.push(current);
  return groups;
}

export function flattenLessonSections(sections: LessonSection[]): LessonSection[] {
  const flat: LessonSection[] = [];
  for (const section of sections) {
    flat.push(section);
    if (section.submodules?.length) {
      flat.push(...section.submodules);
    }
  }
  return flat;
}

export function countLessonSections(sections: LessonSection[]): number {
  return sections.reduce(
    (sum, s) => sum + 1 + (s.submodules?.length ?? 0),
    0
  );
}

export function countParts(sections: LessonSection[]): number {
  return sections.filter((s) => s.type === "part").length;
}

export function estimateReadingMinutes(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function extractMermaidBlocks(content: string): string[] {
  return [...content.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) =>
    m[1].trim()
  );
}
