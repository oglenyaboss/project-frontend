import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080"),
  NEXT_PUBLIC_WS_URL: z.string().url().default("ws://localhost:8000/ws"),
  // Optional backend URL for Docker environments
  BACKEND_API_URL: z.string().url().optional(),
});

// Validate process.env
// Note: We use process.env directly because Next.js inlines NEXT_PUBLIC_ vars at build time
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  BACKEND_API_URL: process.env.BACKEND_API_URL,
});

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 4),
  );
  // Throw error only in development/build, to prevent crash in browser if misconfigured
  if (typeof window === "undefined") {
    throw new Error("Invalid environment variables");
  }
}

export const env = parsed.success
  ? parsed.data
  : (process.env as unknown as z.infer<typeof envSchema>);
