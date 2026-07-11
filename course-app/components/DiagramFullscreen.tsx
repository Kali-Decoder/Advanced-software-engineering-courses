"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface DiagramFullscreenProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function DiagramFullscreen({
  open,
  onClose,
  title,
  children,
}: DiagramFullscreenProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Fullscreen: ${title}` : "Fullscreen diagram"}
      onClick={onClose}
    >
      <div
        className="relative mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
              Architecture Diagram
            </p>
            {title && (
              <p className="truncate text-sm font-medium text-neutral-950">{title}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fullscreen"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 transition hover:border-neutral-300 hover:bg-white hover:text-neutral-950"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative flex-1 overflow-auto p-4 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10 flex min-h-full items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function MaximizeButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Maximize diagram"
      title="Maximize"
      className={`flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 ${className}`}
    >
      <MaximizeIcon />
    </button>
  );
}

function MaximizeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 1h4v4M5 13H1V9M13 1 8 6M1 13l5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2l10 10M12 2 2 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
