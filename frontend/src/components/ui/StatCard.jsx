import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const colorMap = {
  indigo: {
    text:   "text-indigo-400",
    bg:     "bg-indigo-500/10",
    border: "border-indigo-500/20",
    bar:    "bg-indigo-500",
    glow:   "shadow-[0_0_20px_rgba(var(--accent-rgb),0.12)]",
    ambient:"bg-indigo-500/10",
  },
  emerald: {
    text:   "text-emerald-400",
    bg:     "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar:    "bg-emerald-500",
    glow:   "shadow-[0_0_20px_rgba(16,185,129,0.12)]",
    ambient:"bg-emerald-500/10",
  },
  amber: {
    text:   "text-amber-400",
    bg:     "bg-amber-500/10",
    border: "border-amber-500/20",
    bar:    "bg-amber-500",
    glow:   "shadow-[0_0_20px_rgba(245,158,11,0.12)]",
    ambient:"bg-amber-500/10",
  },
  rose: {
    text:   "text-rose-400",
    bg:     "bg-rose-500/10",
    border: "border-rose-500/20",
    bar:    "bg-rose-500",
    glow:   "shadow-[0_0_20px_rgba(244,63,94,0.12)]",
    ambient:"bg-rose-500/10",
  },
  violet: {
    text:   "text-violet-400",
    bg:     "bg-violet-500/10",
    border: "border-violet-500/20",
    bar:    "bg-violet-500",
    glow:   "shadow-[0_0_20px_rgba(139,92,246,0.12)]",
    ambient:"bg-violet-500/10",
  },
  purple: {
    text:   "text-purple-400",
    bg:     "bg-purple-500/10",
    border: "border-purple-500/20",
    bar:    "bg-purple-500",
    glow:   "shadow-[0_0_20px_rgba(168,85,247,0.12)]",
    ambient:"bg-purple-500/10",
  },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "up",
  color = "indigo",
  delay = 0,
}) => {
  const theme = colorMap[color] || colorMap.indigo;

  const isTrendObject = trend && typeof trend === "object";
  const trendText = isTrendObject ? trend.value : trend;
  const resolvedTrendType = isTrendObject
    ? (trend.positive ? "up" : "down")
    : trendType;

  const TrendIcon =
    resolvedTrendType === "up" ? ArrowUpRight :
    resolvedTrendType === "down" ? ArrowDownRight :
    Minus;

  const trendColor =
    resolvedTrendType === "up"   ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" :
    resolvedTrendType === "down" ? "text-rose-400 bg-rose-500/10 border-rose-500/25" :
                                   "text-slate-400 bg-slate-500/10 border-slate-500/25";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`
        relative overflow-hidden glass-card p-6 group
        ${theme.glow}
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${theme.bar} opacity-70`} />

      {/* Ambient glow blob */}
      <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-30 pointer-events-none ${theme.ambient}`} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none break-all">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`
            p-3 rounded-xl ${theme.bg} ${theme.border} border ${theme.text}
            group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-3
          `}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trendText && (
        <div className="flex items-center gap-2 mt-4 relative z-10">
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md border ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {trendText}
          </span>
          <span className="text-xs text-slate-600 font-medium">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
