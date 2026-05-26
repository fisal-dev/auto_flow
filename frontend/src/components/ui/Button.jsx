import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  isLoading = false,
  icon: Icon = null,
  iconPosition = "left",
  fullWidth = false,
}) => {
  const sizes = {
    sm:  "px-3.5 py-1.5 text-xs rounded-lg gap-1.5 h-8",
    md:  "px-5 py-2.5 text-sm rounded-xl gap-2 h-10",
    lg:  "px-7 py-3.5 text-base rounded-xl gap-2.5 h-12",
    xl:  "px-9 py-4 text-base rounded-2xl gap-3 h-14",
  };

  const variants = {
    primary: [
      "bg-indigo-600 text-primary-foreground font-semibold",
      "border border-indigo-500/60",
      "shadow-[0_0_20px_rgba(var(--accent-rgb),0.25)]",
      "hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)]",
      "active:bg-indigo-700",
    ].join(" "),

    secondary: [
      "glass-panel text-white font-semibold",
      "hover:bg-white/10 hover:border-white/15",
    ].join(" "),

    ghost: [
      "bg-transparent text-slate-300 font-semibold",
      "hover:bg-white/5 hover:text-white",
      "border border-transparent hover:border-white/8",
    ].join(" "),

    outline: [
      "bg-transparent text-indigo-400 font-semibold",
      "border border-indigo-500/35",
      "hover:bg-indigo-500/10 hover:border-indigo-500/60 hover:text-indigo-300",
    ].join(" "),

    danger: [
      "bg-rose-600 text-white font-semibold",
      "border border-rose-500/50",
      "shadow-[0_0_20px_rgba(244,63,94,0.2)]",
      "hover:bg-rose-500 hover:shadow-[0_0_30px_rgba(244,63,94,0.35)]",
    ].join(" "),

    success: [
      "bg-emerald-600 text-white font-semibold",
      "border border-emerald-500/50",
      "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      "hover:bg-emerald-500",
    ].join(" "),
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.975 }}
      className={[
        "relative inline-flex items-center justify-center",
        "transition-all duration-200",
        "disabled:opacity-45 disabled:pointer-events-none",
        "overflow-hidden group select-none",
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {/* Shimmer overlay for primary */}
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      )}

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === "left" ? (
        <Icon className="shrink-0 w-4 h-4" />
      ) : null}

      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {!isLoading && Icon && iconPosition === "right" && (
        <Icon className="shrink-0 w-4 h-4" />
      )}
    </motion.button>
  );
};

export default Button;
