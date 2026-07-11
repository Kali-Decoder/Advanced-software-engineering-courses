export function Skeleton({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <div
      className={`${variant === "dark" ? "skeleton-shimmer-dark" : "skeleton-shimmer"} rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}
