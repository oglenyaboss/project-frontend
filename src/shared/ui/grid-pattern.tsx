"use client";

import { useId } from "react";
import { cn } from "@/shared/lib";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: [x: number, y: number][];
  strokeDasharray?: string | number;
  className?: string;
  [key: string]: unknown;
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  squares,
  className,
  ...props
}: GridPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width - 1}
              height={height - 1}
              x={x * width + 1}
              y={y * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

// Additional Aurora/Beam effect component
export function BackgroundBeams() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -inset-[10px] opacity-30">
        <div
          className={cn(
            "absolute top-0 left-1/4 w-96 h-96 bg-primary/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob",
          )}
        />
        <div
          className={cn(
            "absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000",
          )}
        />
      </div>
      <GridPattern
        className="opacity-[0.15] [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        width={30}
        height={30}
      />
    </div>
  );
}
