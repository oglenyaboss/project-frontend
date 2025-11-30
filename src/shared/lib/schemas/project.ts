/**
 * Zod схемы для Project
 */

import { z } from "zod";

// ==================== Response Schemas ====================

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

export const projectsListSchema = z.object({
  items: z.array(projectSchema),
  total: z.number(),
});

// ==================== Request Schemas ====================

export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(4, "Название должно содержать минимум 4 символа")
    .max(50, "Название не должно превышать 50 символов"),
  description: z.string().nullable().optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().nullable().optional(),
});

// ==================== Types ====================

export type Project = z.infer<typeof projectSchema>;
export type ProjectsList = z.infer<typeof projectsListSchema>;
export type ProjectCreateRequest = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateRequest = z.infer<typeof projectUpdateSchema>;
