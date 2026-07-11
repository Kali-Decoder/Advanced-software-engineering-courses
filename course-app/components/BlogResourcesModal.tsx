"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { BlogResource } from "@/lib/blog-resources";

interface BlogResourcesModalProps {
  open: boolean;
  onClose: () => void;
  resources: BlogResource[];
}

export function BlogResourcesModal({
  open,
  onClose,
  resources,
}: BlogResourcesModalProps) {
  const [query, setQuery] = useState("");

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

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return resources;
    return resources.filter(({ term }) =>
      term.toLowerCase().includes(normalized)
    );
  }, [query, resources]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Blog resources"
      onClick={onClose}
    >
      <div
        className="relative mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
                Terminology
              </p>
              <h2 className="font-serif text-xl font-bold text-neutral-950 sm:text-2xl">
                Blog Resources
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {resources.length} articles to deepen your understanding of key
                backend concepts.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close blog resources"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 transition hover:border-neutral-300 hover:bg-white hover:text-neutral-950"
            >
              <CloseIcon />
            </button>
          </div>

          <label className="mt-4 block">
            <span className="sr-only">Search terminologies</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search terminologies…"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            />
          </label>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
              No terminologies match &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map(({ term, url }) => (
                <li key={term}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition hover:border-neutral-950 hover:shadow-sm"
                  >
                    <span className="min-w-0 font-medium text-neutral-950 group-hover:underline">
                      {term}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-400 transition group-hover:text-neutral-950">
                      Read
                      <ExternalLinkIcon />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
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

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 2h6v6M10 2 5 7M8 10H2V4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
