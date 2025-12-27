import { describe, it, expect, vi, afterEach } from "vitest";
import { logRequest, logResponse } from "./bff-logger";

describe("bff-logger", () => {
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  it("should log request with method and url", () => {
    logRequest("GET", "/api/test", { route: "test" });
    expect(consoleLogSpy).toHaveBeenCalled();
    // Check if some part of the log contains the URL
    const calls = consoleLogSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("/api/test");
    expect(calls).toContain("GET");
  });

  it("should log response body when enabled", () => {
    logResponse(
      "POST",
      "/api/test",
      200,
      100,
      { route: "test", logResponse: true },
      JSON.stringify({ success: true }),
    );
    const calls = consoleLogSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("Response Body");
    expect(calls).toContain("success");
  });

  it("should not log response body when disabled", () => {
    logResponse(
      "POST",
      "/api/test",
      200,
      100,
      { route: "test", logResponse: false },
      JSON.stringify({ success: true }),
    );
    const calls = consoleLogSpy.mock.calls.flat().join(" ");
    expect(calls).not.toContain("Response Body");
  });
});
