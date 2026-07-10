import modulesData from "./modules.json";
import type { CourseData } from "@/lib/types";

export const COURSE = modulesData as CourseData;

export const COURSE_META = {
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
};

export const LEVEL_ORDER: string[] = [
  "Foundation",
  "Core",
  "Intermediate",
  "Advanced",
  "Research",
  "Capstone",
];

export function getModule(id: number) {
  return COURSE.modules.find((m) => m.id === id);
}

export function checkpointId(moduleId: number, index: number) {
  return `m${moduleId}-cp${index}`;
}

export function finalChecklistId(index: number) {
  return `final-${index}`;
}
