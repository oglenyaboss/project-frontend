import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Публичные роуты — доступны без авторизации
 */
const PUBLIC_ROUTES = ["/login", "/register", "/"];

/**
 * Auth роуты — редирект на dashboard если уже залогинен
 */
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Пропускаем API роуты (они обрабатывают авторизацию сами)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Пропускаем статические файлы
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Если не авторизован и не на публичной странице → login
  const isPublicRoute =
    pathname === "/" ||
    PUBLIC_ROUTES.some((route) => route !== "/" && pathname.startsWith(route));

  if (!accessToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // Сохраняем URL для редиректа после логина
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если авторизован и на auth странице → dashboard
  const response =
    accessToken && AUTH_ROUTES.some((route) => pathname.startsWith(route))
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' ws: wss: http: https:;",
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
