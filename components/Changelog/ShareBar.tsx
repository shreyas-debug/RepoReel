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
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy/95 backdrop-blur-md sm:border-t sm:bg-navy/90
        max-sm:rounded-t-2xl max-sm:border-x max-sm:border-b-0 max-sm:shadow-[0_-12px_40px_rgba(0,0,0,0.45)]
        max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:py-3">
        <p className="hidden text-sm text-muted sm:block">Share</p>
        <p className="text-center text-xs font-medium text-muted sm:hidden">
          Share this changelog
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => copy("link")}
            className="min-h-[44px] flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10 sm:min-h-0 sm:flex-none"
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => copy("embed")}
            className="min-h-[44px] flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10 sm:min-h-0 sm:flex-none"
          >
            {copied === "embed" ? "Copied!" : "Copy embed"}
          </button>
        </div>
      </div>
    </div>
  );
}
