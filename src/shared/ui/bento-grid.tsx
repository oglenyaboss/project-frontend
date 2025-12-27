"use client";

import { cn } from "@/shared/lib";
import { motion } from "framer-motion";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className,
      )}
    >
      {children}
    </div>
  );
};

import { Spotlight } from "./spotlight";

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "row-span-1 rounded-xl group/bento transition duration-200 shadow-input dark:shadow-none p-4 justify-between flex flex-col space-y-4 overflow-hidden z-20 relative backdrop-blur-md bg-white/70 dark:bg-black/50 border border-white/20 dark:border-white/10",
        className,
      )}
    >
      <Spotlight
        className="h-full flex flex-col justify-between"
        spotlightColor="rgba(0, 224, 255, 0.2)"
      >
        {header}
        <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
            {title}
          </div>
          <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
            {description}
          </div>
        </div>
      </Spotlight>
    </motion.div>
  );
};
