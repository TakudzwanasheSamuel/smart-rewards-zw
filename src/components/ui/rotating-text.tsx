"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
}

export default function RotatingText({ 
  texts, 
  rotationInterval = 3000, 
  className = "" 
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [texts.length, rotationInterval]);

  return (
    <div className={`relative min-h-[1.5em] ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-foreground font-bold text-2xl md:text-3xl"
        >
          {texts[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
