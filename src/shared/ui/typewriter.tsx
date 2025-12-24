"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function useTypewriter(text: string, speed: number = 15) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset logic
    if (text.length < displayedText.length) {
      setDisplayedText("");
      setCurrentIndex(0);
    } else if (text !== displayedText && currentIndex >= text.length) {
      setDisplayedText(text);
    }
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return displayedText;
}

export function Typewriter({ text, speed = 15, className }: TypewriterProps) {
  const displayedText = useTypewriter(text, speed);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {displayedText}
    </motion.span>
  );
}
