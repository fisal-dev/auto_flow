import React from "react";
import { motion } from "framer-motion";

const Card = ({
  children,
  className = "",
  variant = "default",
  glowingBorder = false,
  hoverEffect = true,
  delay = 0,
  noPadding = false,
  onClick,
}) => {
  const variants = {
    default: "glass-card",
    elevated: "glass-card shadow-2xl",
    bordered: "glass-card border-white/10",
    ghost: "bg-transparent border border-white/5 rounded-2xl",
    solid: "bg-[#111827] border border-white/5 rounded-2xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`
        ${variants[variant] || variants.default}
        ${noPadding ? "" : "p-6"}
        ${glowingBorder ? "glow-border shadow-[0_0_30px_rgba(var(--accent-rgb),0.12)]" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
