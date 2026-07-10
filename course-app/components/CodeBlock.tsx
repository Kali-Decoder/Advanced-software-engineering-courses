"use client";

import { useState, type ReactNode } from "react";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const el = node as { props: { children?: ReactNode } };
    return extractText(el.props.children);
  }
  return "";
}

export function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = extractText(children).trim();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4">
      <button
        type="button"
        onClick={copy}
        className="absolute right-3 top-3 z-10 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 opacity-0 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white group-hover:opacity-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 pt-10 text-[0.82rem] leading-relaxed text-neutral-100">
        {children}
      </pre>
    </div>
  );
}
