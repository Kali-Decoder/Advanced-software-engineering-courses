"use client";

import { useState } from "react";
import { renderDiagram } from "@/lib/diagrams";
import { DiagramFullscreen, MaximizeButton } from "./DiagramFullscreen";

function normalizeSvg(html: string) {
  return html
    .replace(
      /<svg\b([^>]*)>/,
      '<svg$1 style="width:100%;max-width:100%;height:auto;display:block" overflow="hidden">'
    )
    .replace(/\sclass="diagram-svg"/g, ' class="diagram-svg" overflow="hidden"');
}

export function Diagram({ name }: { name: string }) {
  const [fullscreen, setFullscreen] = useState(false);
  const svgHtml = normalizeSvg(renderDiagram(name));

  return (
    <>
      <div className="group relative w-full max-w-full min-w-0 py-2">
        <div className="absolute right-0 top-0 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 sm:opacity-100">
          <MaximizeButton onClick={() => setFullscreen(true)} />
        </div>
        <div
          className="diagram-container w-full max-w-full min-w-0 py-2"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </div>

      <DiagramFullscreen
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={name.replace(/-/g, " ")}
      >
        <div
          className="diagram-container w-full max-w-6xl [&_svg]:mx-auto"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </DiagramFullscreen>
    </>
  );
}
