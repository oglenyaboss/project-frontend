import { describe, it, expect, vi } from "vitest";
import { middleware } from "./middleware";
import { NextRequest, NextResponse } from "next/server";

// Mock NextRequest and NextResponse
vi.mock("next/server", () => {
  const actual = vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({
        headers: new Headers(),
        cookies: { set: vi.fn() },
      })),
      redirect: vi.fn((url) => ({ headers: new Headers(), url })),
    },
  };
});

describe("middleware", () => {
  it("should allow public routes", () => {
    const req = {
      nextUrl: { pathname: "/login" },
      cookies: { get: () => undefined },
      url: "http://localhost:3000/login",
    } as unknown as NextRequest;

    middleware(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("should redirect to login if unauthenticated on protected route", () => {
    const req = {
      nextUrl: { pathname: "/dashboard" },
      cookies: { get: () => undefined },
      url: "http://localhost:3000/dashboard",
    } as unknown as NextRequest;

    middleware(req);
    // Should call redirect
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it("should redirect to dashboard if authenticated on login page", () => {
    const req = {
      nextUrl: { pathname: "/login" },
      cookies: { get: () => ({ value: "token" }) },
      url: "http://localhost:3000/login",
    } as unknown as NextRequest;

    middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalled();
  });
});
