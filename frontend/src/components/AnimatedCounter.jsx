import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const AnimatedCounter = ({ children, duration = 2.5 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.3 });

  const extractNumberAndFormat = (text) => {
    // Extract number and format from text like "5L+", "₹50Cr+", "99.9%"
    const match = text.match(/(₹?)(\d+(?:\.\d+)?)(L|Cr|%|\+|.*)/);
    if (!match) return { prefix: "", number: 0, suffix: text };

    const [, prefix, numberStr, suffix] = match;
    let number = parseFloat(numberStr);

    // Convert to actual numbers for animation
    if (suffix.includes("Cr")) {
      number = number; // Keep as is for display
    } else if (suffix.includes("L")) {
      number = number; // Keep as is for display
    }

    return { prefix, number, suffix };
  };

  const AnimatedText = ({ originalText }) => {
    const [displayText, setDisplayText] = useState("0");
    const { prefix, number, suffix } = extractNumberAndFormat(originalText);

    useEffect(() => {
      if (isInView) {
        let startTime;
        const startValue = 0;

        const animate = (currentTime) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min(
            (currentTime - startTime) / (duration * 1000),
            1
          );

          // Easing function
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue =
            startValue + (number - startValue) * easeOutQuart;

          // Format the display text
          let formattedValue;
          if (suffix.includes("%")) {
            formattedValue = currentValue.toFixed(1);
          } else if (Number.isInteger(number)) {
            formattedValue = Math.floor(currentValue).toString();
          } else {
            formattedValue = currentValue.toFixed(1);
          }

          setDisplayText(`${prefix}${formattedValue}${suffix}`);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplayText(originalText);
          }
        };

        requestAnimationFrame(animate);
      }
    }, [isInView, originalText, number, prefix, suffix]);

    return <span>{displayText}</span>;
  };

  const processChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (typeof child === "string") {
        // Check if string contains numbers that should be animated
        if (/\d/.test(child)) {
          return <AnimatedText originalText={child} />;
        }
        return child;
      }

      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...child.props,
          children: processChildren(child.props.children),
        });
      }

      return child;
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, threshold: 0.3 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
    >
      {processChildren(children)}
    </motion.div>
  );
};

export default AnimatedCounter;
