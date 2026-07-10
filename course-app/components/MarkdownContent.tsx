"use client";

import { createContext, useContext, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SectionType } from "@/lib/parse-lesson";
import { CodeBlock } from "./CodeBlock";

const ListKindContext = createContext<"ul" | "ol">("ul");
const HandsOnContext = createContext(false);

function LessonListItem({ children, ...props }: ComponentProps<"li">) {
  const ordered = useContext(ListKindContext) === "ol";
  const isHandsOn = useContext(HandsOnContext);

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

interface MarkdownContentProps {
  content: string;
  variant?: SectionType;
}

export function MarkdownContent({
  content,
  variant = "concept",
}: MarkdownContentProps) {
  const isHandsOn = variant === "hands-on";

  return (
    <HandsOnContext.Provider value={isHandsOn}>
      <div
        className={`lesson-prose max-w-none ${
          isHandsOn ? "lesson-prose-hands-on" : ""
        }`}
      >
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
                  <ul className="my-4 space-y-2.5 pl-0 [&>li]:list-none">
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
              return <CodeBlock>{children}</CodeBlock>;
            },
            code({ className, children, ...props }) {
              const isBlock = className?.includes("language-");
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
          {content}
        </ReactMarkdown>
      </div>
    </HandsOnContext.Provider>
  );
}
