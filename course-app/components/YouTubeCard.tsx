"use client";

import Image from "next/image";
import type { ParsedYouTubeLink } from "@/lib/youtube";

interface YouTubeCardProps {
  link: ParsedYouTubeLink;
  title?: string;
  compact?: boolean;
}

function kindLabel(kind: ParsedYouTubeLink["kind"]) {
  switch (kind) {
    case "video":
      return "Video";
    case "playlist":
      return "Playlist";
    case "channel":
      return "Channel";
    default:
      return "YouTube";
  }
}

export function YouTubeCard({ link, title, compact = false }: YouTubeCardProps) {
  const displayTitle = title?.trim() || "Watch on YouTube";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`video-card group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-950 hover:shadow-lg ${
        compact ? "" : "sm:flex"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-neutral-950 ${
          compact ? "aspect-video w-full" : "aspect-video w-full sm:w-56 md:w-64"
        }`}
      >
        {link.thumbnailUrl ? (
          <Image
            src={link.thumbnailUrl}
            alt=""
            fill
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 256px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-700">
            <span className="text-4xl text-red-500">▶</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-110 group-hover:bg-red-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
          {kindLabel(link.kind)}
        </span>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col justify-center ${compact ? "p-4" : "p-4 sm:p-5"}`}>
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-red-600">
          YouTube Tutorial
        </p>
        <h4 className="line-clamp-2 font-serif text-base font-semibold leading-snug text-neutral-950 group-hover:underline">
          {displayTitle}
        </h4>
        <p className="mt-2 line-clamp-1 text-xs text-neutral-500">{link.url}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-neutral-950">
          Watch now
          <span className="transition group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </a>
  );
}

interface YouTubeGalleryProps {
  links: ParsedYouTubeLink[];
  titles?: string[];
}

export function YouTubeGallery({ links, titles = [] }: YouTubeGalleryProps) {
  if (!links.length) return null;

  return (
    <div className="video-gallery my-4 grid gap-4">
      {links.map((link, i) => (
        <YouTubeCard key={`${link.url}-${i}`} link={link} title={titles[i]} />
      ))}
    </div>
  );
}
