import React from "react";
import { motion } from "framer-motion";

export default function HomeTransition({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Main content with subtle entrance */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {children}
      </motion.div>

      <motion.div
        className="fixed inset-0 bg-neutral-50 z-50 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    </div>
  );
}
