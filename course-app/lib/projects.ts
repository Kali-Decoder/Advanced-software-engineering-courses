import type { CourseId, ProgressState, ProjectStatus } from "@/lib/types";
import backendProjects from "./course/backend-distributed-systems/projects.json";

export interface ProjectTier {
  id: number;
  label: string;
  description: string;
}

export interface Project {
  id: number;
  title: string;
  inspiredBy: string;
  description: string;
  tier: number;
  technologies: string[];
  keyLearnings: string[];
}

export interface ProjectCatalog {
  suggestedPath: number[];
  tiers: ProjectTier[];
  projects: Project[];
}

export interface ProjectProgressSummary {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percent: number;
}

const PROJECT_CATALOGS: Partial<Record<CourseId, ProjectCatalog>> = {
  "backend-distributed-systems": backendProjects as ProjectCatalog,
};

export function getProjectCatalog(courseId: CourseId): ProjectCatalog | null {
  return PROJECT_CATALOGS[courseId] ?? null;
}

export function getProjects(courseId: CourseId): Project[] {
  return getProjectCatalog(courseId)?.projects ?? [];
}

export function hasProjects(courseId: CourseId): boolean {
  return getProjects(courseId).length > 0;
}

export function getProjectStatus(
  projectId: number,
  state: ProgressState
): ProjectStatus {
  return state.projects?.[projectId] ?? "not_started";
}

export function setProjectStatus(
  state: ProgressState,
  projectId: number,
  status: ProjectStatus
): ProgressState {
  return {
    ...state,
    projects: {
      ...(state.projects ?? {}),
      [projectId]: status,
    },
  };
}

export function getProjectProgressSummary(
  courseId: CourseId,
  state: ProgressState
): ProjectProgressSummary {
  const projects = getProjects(courseId);
  const total = projects.length;
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const project of projects) {
    const status = getProjectStatus(project.id, state);
    if (status === "completed") completed += 1;
    else if (status === "in_progress") inProgress += 1;
    else notStarted += 1;
  }

  return {
    total,
    completed,
    inProgress,
    notStarted,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}
