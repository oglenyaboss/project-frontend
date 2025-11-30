/**
 * Public API для entities/interview
 */

// API
export {
  getInterviews,
  getInterview,
  uploadInterview,
  updateInterview,
  deleteInterview,
} from "./api/interview-api";

// Types
export type {
  Interview,
  InterviewShallow,
  InterviewsList,
  InterviewUpdateRequest,
  InterviewStatus,
  InterviewType,
} from "./model/types";

// Queries (TanStack Query hooks)
export {
  useInterviews,
  useInterview,
  useUploadInterview,
  useUpdateInterview,
  useDeleteInterview,
} from "./model/queries";

// WebSocket hook
export { useInterviewStatus } from "./model/use-interview-status";

// UI Components
export { InterviewCard } from "./ui/interview-card";
export {
  InterviewStatusBadge,
  InterviewTypeBadge,
} from "./ui/interview-status-badge";
