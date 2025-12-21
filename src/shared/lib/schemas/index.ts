/**
 * Public API для Zod схем
 */

// Auth
export {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  tokenSchema,
  type LoginRequest,
  type RegisterRequest,
  type RefreshTokenRequest,
  type TokenResponse,
} from "./auth";

// User
export {
  userSchema,
  userUpdateSchema,
  type User,
  type UserUpdateRequest,
} from "./user";

// Project
export {
  projectStatusEnum,
  projectFileBaseSchema,
  projectSchema,
  projectShallowSchema,
  projectsListSchema,
  projectCreateSchema,
  projectUpdateSchema,
  type ProjectStatus,
  type ProjectFileBase,
  type Project,
  type ProjectShallow,
  type ProjectsList,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
} from "./project";


// Interview - REMOVED (endpoints no longer exist in backend)


// Agent Session
export {
  sessionStatusEnum,
  agentSessionStatusEnum,
  sessionMessageRoleEnum,
  sessionMessageTypeEnum,
  questionStatusEnum,
  sessionCallbackEnum,
  // WebSocket schemas
  wsQuestionSchema,
  wsAnswerSchema,
  dialogueItemSchema,
  wsResultSchema,
  wsSessionResponseSchema,
  // Other schemas
  agentSessionMessageShallowSchema,
  sessionStatusResponseSchema,
  agentSessionBaseSchema,
  requirementBaseSchema,
  requirementUpdateSchema,
  userSessionAnswerShallowSchema,
  sessionStartProjectContextRequestSchema,
  contextQuestionSchema,
  sessionStartManualContextRequestSchema,
  sessionAnswerRequestSchema,
  type SessionStatus,
  type AgentSessionStatus,
  type SessionMessageRole,
  type SessionMessageType,
  type QuestionStatus,
  type SessionCallbackEvent,
  // WebSocket types
  type WsQuestion,
  type WsAnswer,
  type DialogueItem,
  type WsResult,
  type WsSessionResponse,
  // Other types
  type AgentSessionMessage,
  type SessionStatusResponse,
  type AgentSessionBase,
  type Requirement,
  type RequirementUpdate,
  type UserSessionAnswerShallow,
  type SessionStartProjectContextRequest,
  type ContextQuestion,
  type SessionStartManualContextRequest,
  type SessionAnswerRequest,
} from "./agent-session";
