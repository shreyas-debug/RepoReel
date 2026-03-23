"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export function ShareBar({
  sharePath,
}: {
  /** fallback path if pathname unavailable */
  sharePath: string;
}) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const pathname = usePathname();

  const copy = useCallback(
    async (kind: "link" | "embed") => {
      const path = pathname ?? sharePath;
      const fullUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${path}`
          : path;
      const text =
        kind === "link"
          ? fullUrl
          : `<iframe src="${fullUrl}" title="RepoReel changelog" width="100%" height="720" style="border:0;border-radius:12px" loading="lazy" />`;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(kind);
        window.setTimeout(() => setCopied(null), 2000);
      } catch {
        setCopied(null);
      }
    },
    [pathname, sharePath],
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-navy/90 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:justify-between">
        <p className="hidden text-sm text-muted sm:block">Share</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy("link")}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => copy("embed")}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            {copied === "embed" ? "Copied!" : "Copy embed"}
          </button>
        </div>
      </div>
    </div>
  );
}
