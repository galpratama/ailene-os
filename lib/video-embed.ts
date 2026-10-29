export type VideoEmbed =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string };

// Turns a pasted share link (YouTube, Vimeo, Google Drive, or a direct file) into something a player can render.
export function videoEmbed(value: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    return {
      kind: "iframe",
      src: `https://www.youtube.com/embed/${url.pathname.slice(1)}`,
    };
  }
  if (host.endsWith("youtube.com")) {
    const id =
      url.searchParams.get("v") ??
      url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
    if (id)
      return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
  }
  if (host === "vimeo.com") {
    const id = url.pathname.match(/^\/(\d+)/)?.[1];
    if (id)
      return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
  }
  if (host === "player.vimeo.com")
    return { kind: "iframe", src: url.toString() };
  if (host === "drive.google.com") {
    const id = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
    if (id)
      return {
        kind: "iframe",
        src: `https://drive.google.com/file/d/${id}/preview`,
      };
  }
  if (/\.(mp4|webm|ogg|mov)$/i.test(url.pathname))
    return { kind: "file", src: url.toString() };
  return { kind: "link", src: url.toString() };
}
