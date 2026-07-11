import agenticMemoryData from "./agentic-memory/modules.json";
import backendData from "./backend-distributed-systems/modules.json";
import type { CourseData, CourseId, CourseMeta } from "@/lib/types";

export const COURSES: Record<CourseId, CourseData> = {
  "agentic-memory": agenticMemoryData as CourseData,
  "backend-distributed-systems": backendData as CourseData,
};

export const COURSE_LIST: CourseMeta[] = [
  {
    id: "agentic-memory",
    title: "AI Agent Memory Systems",
    subtitle:
      "A comprehensive course on agentic memory — concepts, architecture, and hands-on practice",
    institution: "Agentic Memory Course",
    format:
      "14 modules covering memory fundamentals through advanced retrieval, graphs, protocols, and a capstone build. Full lesson content, code examples, and checkpoint questions.",
    prerequisites: [
      "Comfortable with Python and basic API calls",
      "No ML background required — everything explained from scratch",
    ],
    pace:
      "~10–12 weeks at a steady pace (Modules 1–3 in weeks 1–2, one module per week after, Module 12 gets 2–3 weeks).",
    moduleCount: 14,
    accent: "neutral",
  },
  {
    id: "backend-distributed-systems",
    title: "Advanced Backend & Distributed Systems Engineering",
    subtitle:
      "Beginner-friendly path with simple explanations, architecture diagrams, video tutorials, and hands-on practice for every module",
    institution: "Backend Engineering Course",
    format:
      "16 easy-edition modules from networking and OS fundamentals through distributed systems, Kafka, Docker, Kubernetes, AWS, observability, and architecture patterns — each with mermaid diagrams, YouTube tutorials, and a hands-on task.",
    prerequisites: [
      "Basic programming experience (you can build a simple API)",
      "Comfort using a terminal is helpful but not required",
    ],
    pace:
      "~16–20 weeks at one module per week. Modules 7 (Kafka) and 10 (Kubernetes) deserve extra depth if you already have experience.",
    moduleCount: 16,
    accent: "blue",
  },
];

export const LEVEL_ORDER: string[] = [
  "Foundation",
  "Core",
  "Intermediate",
  "Advanced",
  "Research",
  "Capstone",
];

export function getCourseMeta(id: CourseId): CourseMeta {
  const meta = COURSE_LIST.find((c) => c.id === id);
  if (!meta) throw new Error(`Unknown course: ${id}`);
  return meta;
}

export function getCourse(id: CourseId): CourseData {
  return COURSES[id];
}

export function getModule(courseId: CourseId, moduleId: number) {
  return COURSES[courseId].modules.find((m) => m.id === moduleId);
}

export function getMaxModuleId(courseId: CourseId): number {
  const modules = COURSES[courseId].modules;
  return modules[modules.length - 1]?.id ?? 0;
}

export function getPrevModuleId(courseId: CourseId, moduleId: number): number | null {
  const modules = COURSES[courseId].modules;
  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return null;
  return modules[idx - 1].id;
}

export function getNextModuleId(courseId: CourseId, moduleId: number): number | null {
  const modules = COURSES[courseId].modules;
  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx < 0 || idx >= modules.length - 1) return null;
  return modules[idx + 1].id;
}

export function checkpointId(moduleId: number, index: number) {
  return `m${moduleId}-cp${index}`;
}

export function finalChecklistId(index: number) {
  return `final-${index}`;
}

export function isValidCourseId(id: string): id is CourseId {
  return id in COURSES;
}

// Backward-compatible exports for gradual migration
export const COURSE = COURSES["agentic-memory"];
export const COURSE_META = getCourseMeta("agentic-memory");
