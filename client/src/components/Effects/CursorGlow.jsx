import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CursorGlow() {
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 z-[-1]"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, #22d3ee 0%, #10b981 30%, transparent 70%)",
      }}
    />
  );
}
