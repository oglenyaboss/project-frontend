/**
 * Public API для entities/project
 */

// API
export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "./api/project-api";

// Types
export type {
  Project,
  ProjectsList,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "./model/types";

// Queries (TanStack Query hooks)
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "./model/queries";
