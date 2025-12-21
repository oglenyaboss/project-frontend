/**
 * Zod схемы для Project
 */

import { z } from "zod";

// ==================== Enums ====================

export const projectStatusEnum = z.enum(["active", "finished"]);

// ==================== Response Schemas ====================

export const projectFileBaseSchema = z.object({
  id: z.number(),
  file_path: z.string(),
  original_name: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  created_at: z.string().datetime(),
});

export const projectSchema = z.object({
  id: z.number(),
  external_id: z.string().nullable().optional(),
  status: projectStatusEnum,
  title: z.string(),
  description: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
  files: z.array(projectFileBaseSchema).default([]),
});

export const projectShallowSchema = z.object({
  id: z.number(),
  status: projectStatusEnum,
  title: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

export const projectsListSchema = z.object({
  items: z.array(projectShallowSchema),
  total: z.number(),
});

// ==================== Request Schemas ====================

export const projectCreateSchema = z.object({
  title: z
    .string()
    .min(4, "Название должно содержать минимум 4 символа")
    .max(50, "Название не должно превышать 50 символов"),
  description: z.string().min(1, "Описание обязательно"),
  files: z.array(z.instanceof(File)).optional(),
});

export const projectUpdateSchema = z.object({
  title: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
});

// ==================== Types ====================

export type ProjectStatus = z.infer<typeof projectStatusEnum>;
export type ProjectFileBase = z.infer<typeof projectFileBaseSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectShallow = z.infer<typeof projectShallowSchema>;
export type ProjectsList = z.infer<typeof projectsListSchema>;
export type ProjectCreateRequest = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateRequest = z.infer<typeof projectUpdateSchema>;
