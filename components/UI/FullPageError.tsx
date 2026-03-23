"use client";

import Link from "next/link";

export function FullPageError({
  title,
  description,
  actionHref = "/",
  actionLabel = "Try another repo",
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 py-16 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-indigo-brand">
        RepoReel
      </p>
      <h1 className="mt-4 max-w-md font-display text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        {description}
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={actionHref}
          className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-xl bg-indigo-brand px-6 py-3 font-medium text-white shadow-lg shadow-indigo-brand/25 transition hover:bg-indigo-500"
        >
          {actionLabel}
        </Link>
        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-medium text-foreground transition hover:bg-white/10"
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
