"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DiagramFullscreen, MaximizeButton } from "./DiagramFullscreen";

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          themeVariables: {
            primaryColor: "#f5f5f5",
            primaryBorderColor: "#0a0a0a",
            primaryTextColor: "#0a0a0a",
            lineColor: "#525252",
            secondaryColor: "#fafafa",
            tertiaryColor: "#ffffff",
            fontFamily: "var(--font-sans), system-ui, sans-serif",
          },
          flowchart: { curve: "basis", padding: 16 },
          sequence: { actorMargin: 48, messageMargin: 40 },
        });

        const id = `mermaid-${reactId.replace(/:/g, "")}`;
        const { svg } = await mermaid.render(id, chart.trim());

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.setAttribute("width", "100%");
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
          setSvgHtml(containerRef.current.innerHTML);
          setReady(true);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <figure className="architecture-diagram my-2 overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-950 text-[0.65rem] text-white">
            ◈
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-400">
              Architecture Diagram
            </p>
            {title && (
              <p className="text-sm font-medium text-neutral-950">{title}</p>
            )}
          </div>
        </div>
        {ready && !error && (
          <MaximizeButton onClick={() => setFullscreen(true)} />
        )}
      </div>

      <div className="relative p-4 sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          ref={containerRef}
          className={`architecture-diagram-canvas relative z-10 min-h-[120px] w-full overflow-x-auto transition-opacity duration-300 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
        {!ready && !error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-500 shadow-sm">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
              Rendering diagram…
            </div>
          </div>
        )}
        {error && (
          <pre className="relative z-10 overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            {error}
            {"\n\n"}
            {chart}
          </pre>
        )}
      </div>

      <DiagramFullscreen
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={title}
      >
        {svgHtml && (
          <div
            className="architecture-diagram-canvas w-full max-w-6xl [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}
      </DiagramFullscreen>
    </figure>
  );
}
