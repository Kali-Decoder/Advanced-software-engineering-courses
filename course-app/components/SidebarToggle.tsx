"use client";

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ collapsed, onToggle }: SidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={`sidebar-toggle flex shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-neutral-950 hover:bg-neutral-950 hover:text-white active:scale-95 ${
        collapsed ? "h-9 w-9" : "h-9 w-9"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className={`transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          collapsed ? "rotate-180" : "rotate-0"
        }`}
      >
        <path
          d="M10 4L6 8L10 12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
