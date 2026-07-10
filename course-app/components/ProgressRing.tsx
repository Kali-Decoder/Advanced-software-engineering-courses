"use client";

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: "light" | "dark";
}

export function ProgressRing({
  percent,
  size = 72,
  strokeWidth = 4,
  className = "",
  variant = "light",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const track = variant === "dark" ? "rgba(255,255,255,0.15)" : "#e5e5e5";
  const stroke = variant === "dark" ? "#ffffff" : "#0a0a0a";
  const textColor = variant === "dark" ? "text-white" : "text-neutral-950";

  return (
    <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold ${textColor}`}>
        {percent}%
      </span>
    </div>
  );
}
