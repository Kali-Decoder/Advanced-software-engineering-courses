export type YouTubeLinkKind = "video" | "playlist" | "channel" | "unknown";

export interface ParsedYouTubeLink {
  kind: YouTubeLinkKind;
  url: string;
  videoId?: string;
  playlistId?: string;
  channelHandle?: string;
  thumbnailUrl?: string;
}

export function parseYouTubeUrl(url: string): ParsedYouTubeLink | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = parsed.pathname.slice(1).split("/")[0];
      if (!videoId) return null;
      return {
        kind: "video",
        url,
        videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v") ?? undefined;
        const playlistId = parsed.searchParams.get("list") ?? undefined;
        if (videoId) {
          return {
            kind: playlistId ? "video" : "video",
            url,
            videoId,
            playlistId,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          };
        }
        if (playlistId) {
          return {
            kind: "playlist",
            url,
            playlistId,
            thumbnailUrl: `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg`,
          };
        }
      }

      if (parsed.pathname.startsWith("/playlist")) {
        const playlistId = parsed.searchParams.get("list") ?? undefined;
        if (!playlistId) return null;
        return {
          kind: "playlist",
          url,
          playlistId,
        };
      }

      if (parsed.pathname.startsWith("/@")) {
        const channelHandle = parsed.pathname.slice(1);
        return {
          kind: "channel",
          url,
          channelHandle,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function extractYouTubeLinks(text: string): ParsedYouTubeLink[] {
  const urlPattern = /https?:\/\/(?:www\.)?(?:youtube\.com\/[^\s)]+|youtu\.be\/[^\s)]+)/gi;
  const matches = text.match(urlPattern) ?? [];
  const seen = new Set<string>();
  const links: ParsedYouTubeLink[] = [];

  for (const match of matches) {
    const clean = match.replace(/[.,;]+$/, "");
    if (seen.has(clean)) continue;
    seen.add(clean);
    const parsed = parseYouTubeUrl(clean);
    if (parsed) links.push(parsed);
  }

  return links;
}
