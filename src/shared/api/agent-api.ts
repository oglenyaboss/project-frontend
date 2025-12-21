/**
 * API methods for Agent Session
 * All calls go through BFF for cookie-based auth
 */
import { api } from "./axios-client";
import type {
    SessionStartProjectContextRequest,
    SessionStartManualContextRequest,
    SessionStatusResponse,
    SessionAnswerRequest,
    Requirement,
    AgentSessionMessage,
    AgentSessionBase,
    UserSessionAnswerShallow,
} from "@/shared/lib/schemas";

export const agentApi = {
    // Start session for a project (Case 1)
    startProjectSession: async (
        projectId: number,
        data: SessionStartProjectContextRequest
    ): Promise<{ data?: AgentSessionBase; error?: string }> => {
        try {
            const response = await api.post<AgentSessionBase>(
                `/agent/sessions/start/project/${projectId}`,
                data
            );
            return { data: response };
        } catch (error) {
            return { error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    // Start session with manual context (Case 2)
    startContextSession: async (
        data: SessionStartManualContextRequest
    ): Promise<{ data?: AgentSessionBase; error?: string }> => {
        try {
            const response = await api.post<AgentSessionBase>(
                `/agent/sessions/start/context`,
                data
            );
            return { data: response };
        } catch (error) {
            return { error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    // Get session status/dialogue
    getSession: async (
        sessionId: number
    ): Promise<{ data?: SessionStatusResponse; error?: string }> => {
        try {
            const response = await api.get<SessionStatusResponse>(
                `/agent/sessions/${sessionId}`
            );
            return { data: response };
        } catch (error) {
            return { error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    // Submit answer
    submitAnswer: async (
        sessionId: number,
        questionId: number,
        data: SessionAnswerRequest
    ): Promise<{ data?: UserSessionAnswerShallow; error?: string }> => {
        try {
            const response = await api.post<UserSessionAnswerShallow>(
                `/agent/sessions/${sessionId}/answer/${questionId}`,
                data
            );
            return { data: response };
        } catch (error) {
            return { error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    // Cancel session
    cancelSession: async (
        sessionId: number
    ): Promise<{ data?: AgentSessionMessage; error?: string }> => {
        try {
            const response = await api.post<AgentSessionMessage>(
                `/agent/sessions/${sessionId}/cancel`
            );
            return { data: response };
        } catch (error) {
            return { error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    // Get requirement
    getRequirement: async (
        requirementId: number
    ): Promise<{ data?: Requirement; error?: string }> => {
        try {
            const response = await api.get<Requirement>(
                `/requirements/${requirementId}`
            );
            return { data: response };
        } catch (error) {
            return { error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    // Export requirements URL (returns URL for download via BFF)
    exportRequirementUrl: (requirementId: number, format: "docx" | "pdf" = "docx") => {
        return `/api/requirements/${requirementId}/export?file=${format}`;
    },

};
