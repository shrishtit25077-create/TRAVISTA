import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TypingText({ text, className = "", delay = 20 }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  return (
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {display}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-1 h-4 ml-1 bg-emerald-500 align-middle"
      />
    </motion.p>
  );
}
