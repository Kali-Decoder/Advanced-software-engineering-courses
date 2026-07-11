import type { CourseId } from "@/lib/types";
import backendBlogResources from "./course/backend-distributed-systems/blog-resources.json";

export interface BlogResource {
  term: string;
  url: string;
}

const BLOG_RESOURCES: Partial<Record<CourseId, BlogResource[]>> = {
  "backend-distributed-systems": backendBlogResources as BlogResource[],
};

export function getBlogResources(courseId: CourseId): BlogResource[] {
  return BLOG_RESOURCES[courseId] ?? [];
}

export function hasBlogResources(courseId: CourseId): boolean {
  return getBlogResources(courseId).length > 0;
}
