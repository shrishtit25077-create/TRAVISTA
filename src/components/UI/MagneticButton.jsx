import React, { useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function MagneticButton({ children, className = "" }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      style={{ position: "relative" }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
    >
      <motion.button
        ref={ref}
        animate={{ x, y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        className={className}
      >
        <span className="relative z-10">{children}</span>
        <motion.div 
          className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"
        />
      </motion.button>
    </motion.div>
  );
}
