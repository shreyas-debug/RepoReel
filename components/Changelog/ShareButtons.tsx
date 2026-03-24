"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export function ShareButtons({
  sharePath,
  className,
}: {
  sharePath: string;
  className?: string;
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
    <div className={className}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
        Share
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => copy("link")}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10"
        >
          {copied === "link" ? "Copied!" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={() => copy("embed")}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10"
        >
          {copied === "embed" ? "Copied!" : "Copy embed"}
        </button>
      </div>
    </div>
  );
}

/** Fixed bottom share actions — mobile only; same copy behavior as ShareButtons. */
export function ShareMobileDock({ sharePath }: { sharePath: string }) {
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
      className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-white/10 bg-[#0A0F1E]/95 p-3 backdrop-blur-md lg:hidden"
    >
      <button
        type="button"
        onClick={() => copy("link")}
        className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5"
      >
        {copied === "link" ? "Copied!" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={() => copy("embed")}
        className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5"
      >
        {copied === "embed" ? "Copied!" : "Copy embed"}
      </button>
    </div>
  );
}
