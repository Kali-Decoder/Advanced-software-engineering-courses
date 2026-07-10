"use client";

interface ProgressBarProps {
  percent: number;
  size?: "default" | "small";
  className?: string;
  shimmer?: boolean;
  variant?: "light" | "dark";
}

export function ProgressBar({
  percent,
  size = "default",
  className = "",
  shimmer = false,
  variant = "light",
}: ProgressBarProps) {
  const height = size === "small" ? "h-1" : "h-1.5";
  const clamped = Math.min(100, Math.max(0, percent));
  const track = variant === "dark" ? "bg-neutral-800" : "bg-neutral-200";

  return (
    <div
      className={`w-full overflow-hidden rounded-full ${track} ${height} ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${
          shimmer && clamped > 0
            ? "progress-shimmer"
            : variant === "dark"
              ? "bg-white"
              : "bg-neutral-950"
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
