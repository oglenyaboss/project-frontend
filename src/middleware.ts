import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Публичные роуты — доступны без авторизации
 */
const PUBLIC_ROUTES = ["/login", "/register"];

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
  if (
    !accessToken &&
    !PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", request.url);
    // Сохраняем URL для редиректа после логина
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если авторизован и на auth странице → dashboard
  if (accessToken && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
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
