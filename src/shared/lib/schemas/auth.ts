/**
 * Zod схемы для Auth
 */

import { z } from "zod";

// ==================== Request Schemas ====================

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  display_name: z.string().min(4, "Имя должно содержать минимум 4 символа"),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string(),
});

// ==================== Response Schemas ====================

export const tokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

// ==================== Types ====================

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type TokenResponse = z.infer<typeof tokenSchema>;
