import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface KpiCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }> | React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: "indigo" | "emerald" | "amber" | "purple" | "slate";
  iconBgClass?: string;
  className?: string;
}

export function KpiCard({
  title,
  label,
  value,
  subtitle,
  subtext,
  icon,
  trend,
  variant = "indigo",
  iconBgClass,
  className,
}: KpiCardProps) {
  const displayTitle = title || label || "";
  const displaySubtext = subtitle || subtext;

  const iconVariants = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[variant];

  // Render icon whether it's a ComponentType or a ReactNode
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function") {
      const IconComp = icon as React.ComponentType<{ className?: string }>;
      return <IconComp className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl p-5 shadow-card hover:border-slate-300 transition-all group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {displayTitle}
        </span>
        <div
          className={cn(
            "w-9 h-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105",
            iconBgClass || iconVariants
          )}
        >
          {renderIcon()}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      {(trend || displaySubtext) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
          {displaySubtext && (
            <span className="text-slate-500">{displaySubtext}</span>
          )}
        </div>
      )}
    </div>
  );
}
