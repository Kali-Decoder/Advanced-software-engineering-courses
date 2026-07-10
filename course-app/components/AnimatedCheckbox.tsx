"use client";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
  id?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  size = "md",
  id,
}: AnimatedCheckboxProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const icon = size === "sm" ? "text-[9px]" : "text-[10px]";

  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${dim} relative shrink-0 rounded border-2 transition-all duration-200 ${
        checked
          ? "border-neutral-950 bg-neutral-950"
          : "border-neutral-300 bg-white hover:border-neutral-950"
      }`}
    >
      {checked && (
        <span
          className={`absolute inset-0 flex items-center justify-center text-white ${icon}`}
          style={{ animation: "check-pop 0.3s ease-out" }}
        >
          ✓
        </span>
      )}
    </button>
  );
}
