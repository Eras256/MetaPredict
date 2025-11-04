"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassmorphicCard({ children, className = "" }: GlassmorphicCardProps) {
  return (
    <motion.div
      className={`glass-card card-hover ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

