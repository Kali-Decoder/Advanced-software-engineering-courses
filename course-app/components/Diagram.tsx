import { renderDiagram } from "@/lib/diagrams";

function normalizeSvg(html: string) {
  return html
    .replace(
      /<svg\b([^>]*)>/,
      '<svg$1 style="width:100%;max-width:100%;height:auto;display:block" overflow="hidden">'
    )
    .replace(/\sclass="diagram-svg"/g, ' class="diagram-svg" overflow="hidden"');
}

export function Diagram({ name }: { name: string }) {
  return (
    <div
      className="diagram-container w-full max-w-full min-w-0 py-2"
      dangerouslySetInnerHTML={{ __html: normalizeSvg(renderDiagram(name)) }}
    />
  );
}
