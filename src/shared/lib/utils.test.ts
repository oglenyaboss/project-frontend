import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("w-full", "h-full")).toBe("w-full h-full");
    });

    it("should handle conditional classes", () => {
      expect(cn("w-full", true && "h-full", false && "bg-red-500")).toBe(
        "w-full h-full",
      );
    });

    it("should merge tailwind classes using tailwind-merge", () => {
      // p-4 should overwrite p-2
      expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("should handle arrays and objects", () => {
      expect(cn(["flex", "items-center"], { "justify-center": true })).toBe(
        "flex items-center justify-center",
      );
    });
  });
});
