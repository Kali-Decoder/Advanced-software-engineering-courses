"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SectionType } from "@/lib/parse-lesson";
import { extractYouTubeLinks, parseYouTubeUrl } from "@/lib/youtube";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";
import { YouTubeCard, YouTubeGallery } from "./YouTubeCard";

const ListKindContext = createContext<"ul" | "ol">("ul");
const HandsOnContext = createContext(false);
const VideoSectionContext = createContext(false);

function LessonListItem({ children, ...props }: ComponentProps<"li">) {
  const ordered = useContext(ListKindContext) === "ol";
  const isHandsOn = useContext(HandsOnContext);
  const isVideoSection = useContext(VideoSectionContext);

  const childText = flattenChildren(children);
  const youtubeLinks = extractYouTubeLinks(childText);

  if (isVideoSection && youtubeLinks.length > 0) {
    const titleMatch = childText.match(/^\*\*([^*]+)\*\*/);
    const title = titleMatch?.[1]?.replace(/:\s*$/, "");
    return (
      <li className="list-none">
        <YouTubeCard link={youtubeLinks[0]} title={title} />
      </li>
    );
  }

  if (ordered && isHandsOn) {
    return (
      <li
        className="lesson-step-item flex gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3"
        {...props}
      >
        <span className="lesson-step-num flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-950" />
        <span className="pt-0.5 text-[0.95rem] leading-relaxed text-neutral-600">
          {children}
        </span>
      </li>
    );
  }

  if (ordered) {
    return (
      <li
        className="lesson-num-item flex gap-3 text-[0.95rem] leading-relaxed text-neutral-600"
        {...props}
      >
        <span className="lesson-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-950" />
        <span className="pt-0.5">{children}</span>
      </li>
    );
  }

  return (
    <li
      className="flex gap-3 text-[0.95rem] leading-relaxed text-neutral-600"
      {...props}
    >
      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950" />
      <span>{children}</span>
    </li>
  );
}

function flattenChildren(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenChildren).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return flattenChildren(props?.children ?? "");
  }
  return "";
}

interface MarkdownContentProps {
  content: string;
  variant?: SectionType;
  sectionTitle?: string;
}

export function MarkdownContent({
  content,
  variant = "concept",
  sectionTitle,
}: MarkdownContentProps) {
  const isHandsOn = variant === "hands-on";
  const isVideo = variant === "video";
  const isDiagram = variant === "diagram";

  const standaloneVideos = isVideo ? extractYouTubeLinks(content) : [];
  const contentWithoutMermaid = content.replace(/```mermaid\n[\s\S]*?```/g, "").trim();

  return (
    <HandsOnContext.Provider value={isHandsOn}>
      <VideoSectionContext.Provider value={isVideo}>
        <div
          className={`lesson-prose max-w-none ${
            isHandsOn ? "lesson-prose-hands-on" : ""
          } ${isDiagram ? "lesson-prose-diagram" : ""} ${
            isVideo ? "lesson-prose-video" : ""
          }`}
        >
          {isVideo && standaloneVideos.length > 0 && (
            <YouTubeGallery
              links={standaloneVideos}
              titles={standaloneVideos.map((_, i) => {
                const lines = content.split("\n");
                const line = lines.find((l) => l.includes(standaloneVideos[i].url));
                const match = line?.match(/\*\*([^*]+)\*\*/);
                return match?.[1]?.replace(/:\s*$/, "") ?? `Tutorial ${i + 1}`;
              })}
            />
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return (
                  <p className="mb-4 text-[0.97rem] leading-[1.75] text-neutral-600 last:mb-0">
                    {children}
                  </p>
                );
              },
              h4({ children }) {
                return (
                  <h4 className="mb-2 mt-6 font-serif text-base font-semibold text-neutral-950">
                    {children}
                  </h4>
                );
              },
              strong({ children }) {
                return (
                  <strong className="font-semibold text-neutral-950">{children}</strong>
                );
              },
              ul({ children }) {
                return (
                  <ListKindContext.Provider value="ul">
                    <ul
                      className={`my-4 space-y-2.5 pl-0 [&>li]:list-none ${
                        isVideo ? "video-list grid gap-4 sm:grid-cols-1" : ""
                      }`}
                    >
                      {children}
                    </ul>
                  </ListKindContext.Provider>
                );
              },
              ol({ children }) {
                return (
                  <ListKindContext.Provider value="ol">
                    <ol
                      className={`my-4 space-y-3 pl-0 [&>li]:list-none ${
                        isHandsOn ? "lesson-steps" : "lesson-numbered"
                      }`}
                    >
                      {children}
                    </ol>
                  </ListKindContext.Provider>
                );
              },
              li: LessonListItem,
              a({ href, children }) {
                if (href) {
                  const yt = parseYouTubeUrl(href);
                  if (yt) {
                    const title = flattenChildren(children);
                    return <YouTubeCard link={yt} title={title} compact />;
                  }
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 transition hover:decoration-neutral-950"
                  >
                    {children}
                  </a>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="my-5 rounded-r-lg border-l-4 border-neutral-950 bg-neutral-50 px-4 py-3 text-[0.95rem] italic text-neutral-600">
                    {children}
                  </blockquote>
                );
              },
              table({ children }) {
                return (
                  <div className="my-5 overflow-x-auto rounded-lg border border-neutral-200">
                    <table className="w-full min-w-[400px] text-sm">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="bg-neutral-50 px-4 py-2.5 text-left font-semibold text-neutral-950">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="border-t border-neutral-200 px-4 py-2.5 text-neutral-600">
                    {children}
                  </td>
                );
              },
              pre({ children }) {
                const child = Array.isArray(children) ? children[0] : children;
                if (
                  child &&
                  typeof child === "object" &&
                  "props" in child &&
                  typeof (child as { props?: { className?: string } }).props?.className ===
                    "string" &&
                  (child as { props: { className: string } }).props.className.includes(
                    "language-mermaid"
                  )
                ) {
                  const chart = flattenChildren(
                    (child as { props: { children?: ReactNode } }).props.children
                  );
                  const diagramTitle = sectionTitle?.replace(/^diagram:\s*/i, "");
                  return <MermaidDiagram chart={chart} title={diagramTitle} />;
                }
                return <CodeBlock>{children}</CodeBlock>;
              },
              code({ className, children, ...props }) {
                const isBlock = className?.includes("language-");
                if (className?.includes("language-mermaid")) {
                  return null;
                }
                if (isBlock) {
                  return (
                    <code className={`${className} font-mono`} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[0.88em] font-medium text-neutral-950"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {isVideo ? contentWithoutMermaid : content}
          </ReactMarkdown>
        </div>
      </VideoSectionContext.Provider>
    </HandsOnContext.Provider>
  );
}
