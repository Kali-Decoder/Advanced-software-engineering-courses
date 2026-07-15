export type CourseLevel =
  | "Foundation"
  | "Core"
  | "Intermediate"
  | "Advanced"
  | "Research"
  | "Capstone";

export type CourseId = "agentic-memory" | "backend-distributed-systems";

export interface Module {
  id: number;
  title: string;
  level: CourseLevel;
  diagram: string;
  description: string;
  content: string;
  checkpoints: string[];
}

export interface CourseData {
  completionChecklist: string[];
  modules: Module[];
}

export interface CourseMeta {
  id: CourseId;
  title: string;
  subtitle: string;
  institution: string;
  format: string;
  prerequisites: string[];
  pace: string;
  moduleCount: number;
  accent: "neutral" | "blue";
}

export type ProjectStatus = "not_started" | "in_progress" | "completed";

export interface ProgressState {
  checkpoints: Record<string, boolean>;
  modulesComplete: Record<number, boolean>;
  completionChecklist: Record<string, boolean>;
  projects: Record<number, ProjectStatus>;
  lastModule: number | null;
  lastUpdated: string | null;
}

export interface AllCoursesProgress {
  courses: Partial<Record<CourseId, ProgressState>>;
}
