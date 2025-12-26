"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-14 h-8 rounded-full bg-muted", className)} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "relative flex w-16 h-8 p-1 rounded-full cursor-pointer transition-colors duration-500 ease-in-out",
        isDark
          ? "bg-[#0f1419] border border-white/10 justify-end"
          : "bg-sky-100 border border-sky-200 justify-start",
        className,
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full shadow-sm z-10",
          isDark ? "bg-[#1f2937] text-white" : "bg-white text-yellow-500",
        )}
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5" fill="currentColor" />
          ) : (
            <Sun className="w-3.5 h-3.5" fill="currentColor" />
          )}
        </motion.div>
      </motion.div>

      {/* Stars decoration for dark mode */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-2 top-2"
        >
          <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-1 left-1 opacity-50" />
          <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-3 left-3 opacity-30" />
          <div className="w-1 h-1 bg-white rounded-full absolute top-2 left-5 opacity-40" />
        </motion.div>

        {/* Clouds decoration for light mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute right-2 top-2"
        >
          <div className="w-3 h-1.5 bg-sky-200 rounded-full absolute top-1 right-1 opacity-50" />
          <div className="w-2 h-1 bg-sky-200 rounded-full absolute top-3 right-4 opacity-50" />
        </motion.div>
      </div>
    </div>
  );
}
