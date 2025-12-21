// Legacy client (deprecated, use api from axios-client)
export { apiClient } from "./client";

// New Axios client with interceptors
export { axiosClient, api, ApiError } from "./axios-client";
export type { ApiErrorResponse, ValidationErrorResponse } from "./axios-client";

// TanStack Query
export { getQueryClient } from "./query-client";
export { queryKeys } from "./query-keys";
export type { PaginationParams, QueryKeys } from "./query-keys";

// Types
export * from "./types";
export { agentApi } from "./agent-api";
