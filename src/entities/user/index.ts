/**
 * Public API для entities/user
 */

// API
export { getCurrentUser, updateCurrentUser } from "./api/user-api";

// Types
export type { User, UserUpdateRequest } from "./model/types";

// Queries (TanStack Query hooks)
export { useCurrentUser, useUpdateUser } from "./model/queries";
