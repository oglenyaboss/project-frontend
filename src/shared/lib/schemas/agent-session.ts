/**
 * Zod schemas for Agent Session
 */
import { z } from "zod";

// ==================== Enums ====================

// SessionStatusEnum - используется в SessionStatusResponse
export const sessionStatusEnum = z.enum([
    "processing",
    "waiting_for_answers",
    "done",
    "error",
    "cancelled",
]);

// AgentSessionStatusEnum - используется в callback событиях
export const agentSessionStatusEnum = z.enum([
    "ASK_USER_GOAL",
    "SELECT_OR_CREATE_PROJECT",
    "ASK_USER_CONTEXT",
    "CHOOSE_MODE",
    "WAITING_FOR_ANSWERS",
    "DRAFT_COLLECTING",
    "VALIDATING",
    "GENERATING_REQUIREMENTS",
    "DONE",
    "CANCELLED",
    "ERROR",
]);

export const sessionMessageRoleEnum = z.enum(["agent", "user"]);

export const sessionMessageTypeEnum = z.enum(["question", "answer", "result"]);

export const questionStatusEnum = z.enum([
    "unanswered",
    "answered",
    "skipped",
]);

export const sessionCallbackEnum = z.enum([
    "questions",
    "finalResult",
    "projectUpdated",
    "error",
]);

// ==================== WebSocket Response Schemas ====================

// Question структура из WebSocket диалога
export const wsQuestionSchema = z.object({
    id: z.number(),
    content: z.string(),
    question_number: z.number(),
    status: questionStatusEnum,
    explanation: z.string().nullable().optional(),
    created_at: z.string(),
});

// Answer структура из WebSocket диалога
export const wsAnswerSchema = z.object({
    id: z.number(),
    content: z.string(),
    created_at: z.string(),
    is_skipped: z.boolean().optional(),
}).nullable();

// Элемент диалога {question, answer}
export const dialogueItemSchema = z.object({
    question: wsQuestionSchema,
    answer: wsAnswerSchema,
});

// Result структура когда сессия завершена
export const wsResultSchema = z.object({
    requirement_id: z.number(),
    content: z.string(),
    created_at: z.string(),
}).nullable().optional();

// Полный ответ WebSocket на ping
export const wsSessionResponseSchema = z.object({
    status: z.string(), // "ok" или "error"
    session_id: z.number(),
    session_status: sessionStatusEnum,
    current_iteration: z.number(),
    dialogue: z.array(dialogueItemSchema).default([]),
    result: wsResultSchema,
});

// ==================== Response Schemas ====================

export const agentSessionMessageShallowSchema = z.object({
    id: z.number(),
    role: sessionMessageRoleEnum,
    message_type: sessionMessageTypeEnum,
    content: z.string(),
    question_external_id: z.string(),
    question_number: z.number().nullable().optional(),
    question_status: questionStatusEnum.nullable().optional(),
    explanation: z.string().nullable().optional(),
    created_at: z.string().datetime(),
});

export const sessionStatusResponseSchema = z.object({
    id: z.number(),
    external_session_id: z.string(),
    status: sessionStatusEnum,
    user_goal: z.string(),
    current_iteration: z.number(),
    messages: z.array(agentSessionMessageShallowSchema).default([]).nullable(),
});

export const agentSessionBaseSchema = z.object({
    id: z.number(),
    external_session_id: z.string().nullable().optional(),
    user_goal: z.string(),
    status: sessionStatusEnum,
    current_iteration: z.number(),
});

export const requirementBaseSchema = z.object({
    id: z.number(),
    content: z.string(),
    created_at: z.string().datetime(),
});

export const requirementUpdateSchema = z.object({
    content: z.string().min(1, "Содержимое не может быть пустым"),
});

export const userSessionAnswerShallowSchema = z.object({
    role: sessionMessageRoleEnum,
    message_type: sessionMessageTypeEnum,
    content: z.string(),
    is_skipped: z.boolean(),
    created_at: z.string().datetime(),
});

// ==================== Request Schemas ====================

export const sessionStartProjectContextRequestSchema = z.object({
    user_goal: z.string().min(1, "Цель не может быть пустой"),
});

export const contextQuestionSchema = z.object({
    task: z.string().min(1, "Обязательное поле"),
    goal: z.string().min(1, "Обязательное поле"),
    value: z.string().min(1, "Обязательное поле"),
});

export const sessionStartManualContextRequestSchema = z.object({
    user_goal: z.string().min(1, "Цель не может быть пустой"),
    context_questions: contextQuestionSchema,
});

export const sessionAnswerRequestSchema = z.object({
    answer: z.string(),
    is_skipped: z.boolean().default(false),
});

// ==================== Types ====================

export type SessionStatus = z.infer<typeof sessionStatusEnum>;
export type AgentSessionStatus = z.infer<typeof agentSessionStatusEnum>;
export type SessionMessageRole = z.infer<typeof sessionMessageRoleEnum>;
export type SessionMessageType = z.infer<typeof sessionMessageTypeEnum>;
export type QuestionStatus = z.infer<typeof questionStatusEnum>;
export type SessionCallbackEvent = z.infer<typeof sessionCallbackEnum>;

// WebSocket types
export type WsQuestion = z.infer<typeof wsQuestionSchema>;
export type WsAnswer = z.infer<typeof wsAnswerSchema>;
export type DialogueItem = z.infer<typeof dialogueItemSchema>;
export type WsResult = z.infer<typeof wsResultSchema>;
export type WsSessionResponse = z.infer<typeof wsSessionResponseSchema>;

export type AgentSessionMessage = z.infer<typeof agentSessionMessageShallowSchema>;
export type SessionStatusResponse = z.infer<typeof sessionStatusResponseSchema>;
export type AgentSessionBase = z.infer<typeof agentSessionBaseSchema>;
export type Requirement = z.infer<typeof requirementBaseSchema>;
export type RequirementUpdate = z.infer<typeof requirementUpdateSchema>;
export type UserSessionAnswerShallow = z.infer<typeof userSessionAnswerShallowSchema>;

export type SessionStartProjectContextRequest = z.infer<
    typeof sessionStartProjectContextRequestSchema
>;
export type ContextQuestion = z.infer<typeof contextQuestionSchema>;
export type SessionStartManualContextRequest = z.infer<
    typeof sessionStartManualContextRequestSchema
>;
export type SessionAnswerRequest = z.infer<typeof sessionAnswerRequestSchema>;
