/**
 * Public API для entities/project
 */

// API
export {
  getProjects,
  getProject,
  createProject,
  addFilesToProject,
  deleteProject,
} from "./api/project-api";

// Types
export type {
  ProjectStatus,
  ProjectFileBase,
  Project,
  ProjectShallow,
  ProjectsList,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "./model/types";

// Queries (TanStack Query hooks)
export {
  useProjects,
  useProject,
  useCreateProject,
  useAddFilesToProject,
  useDeleteProject,
} from "./model/queries";

// UI Components
export { ProjectCard } from "./ui/project-card";
