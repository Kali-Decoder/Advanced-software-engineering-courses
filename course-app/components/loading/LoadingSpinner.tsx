interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const SIZE = {
  sm: "h-4 w-4 border-[1.5px]",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  label,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className={`inline-block animate-spin rounded-full border-neutral-200 border-t-neutral-950 ${SIZE[size]}`}
      />
      {label && (
        <p className="text-sm font-medium text-neutral-500">{label}</p>
      )}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}
