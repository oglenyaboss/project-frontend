/**
 * Zod схемы для Interview
 */

import { z } from "zod";

import { projectSchema } from "./project";

// ==================== Enums ====================

export const interviewStatusEnum = z.enum([
  "uploaded",
  "processing",
  "question",
  "done",
  "error",
  "cancelled",
]);

export const interviewTypeEnum = z.enum(["text", "text_file", "audio"]);

// ==================== Response Schemas ====================

export const interviewShallowSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: interviewTypeEnum,
  status: interviewStatusEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

export const interviewSchema = interviewShallowSchema.extend({
  content: z.string().nullable().optional(),
  file_path: z.string().nullable().optional(),
  project: projectSchema,
});

export const interviewsListSchema = z.object({
  items: z.array(interviewShallowSchema),
  total: z.number(),
});

// ==================== Request Schemas ====================

export const interviewUpdateSchema = z.object({
  name: z.string().min(1, "Название не может быть пустым").optional(),
});

// ==================== Types ====================

export type InterviewStatus = z.infer<typeof interviewStatusEnum>;
export type InterviewType = z.infer<typeof interviewTypeEnum>;
export type InterviewShallow = z.infer<typeof interviewShallowSchema>;
export type Interview = z.infer<typeof interviewSchema>;
export type InterviewsList = z.infer<typeof interviewsListSchema>;
export type InterviewUpdateRequest = z.infer<typeof interviewUpdateSchema>;
