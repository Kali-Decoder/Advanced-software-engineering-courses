export type CourseLevel =
  | "Foundation"
  | "Core"
  | "Intermediate"
  | "Advanced"
  | "Research"
  | "Capstone";

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

export interface ProgressState {
  checkpoints: Record<string, boolean>;
  modulesComplete: Record<number, boolean>;
  completionChecklist: Record<string, boolean>;
  lastModule: number | null;
  lastUpdated: string | null;
}
