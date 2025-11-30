/**
 * Zod схемы для User
 */

import { z } from "zod";

// ==================== Response Schemas ====================

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  display_name: z.string(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

// ==================== Request Schemas ====================

export const userUpdateSchema = z.object({
  display_name: z.string().min(1, "Имя не может быть пустым"),
});

// ==================== Types ====================

export type User = z.infer<typeof userSchema>;
export type UserUpdateRequest = z.infer<typeof userUpdateSchema>;
