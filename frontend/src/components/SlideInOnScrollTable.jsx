// SlideInOnScroll.tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function SlideInOnScrollTable({ children }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 100%", "end 95%"], // when top enters, when bottom exits
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 1]); // slide from below
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]); // fade in

  return (
    <motion.div ref={ref} style={{ y, opacity }}>
      {children}
    </motion.div>
  );
}
