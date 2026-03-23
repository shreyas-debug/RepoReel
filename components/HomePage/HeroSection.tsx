"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { encodeTagRange } from "@/lib/range";
import { parseRepoInput, sessionPayloadKey } from "@/lib/parseRepo";
import type { CachedChangelogPayload } from "@/lib/types";
import { ApiErrorCode } from "@/lib/api-errors";
import { LoadingStory } from "@/components/UI/LoadingStory";
import { TagPicker } from "@/components/UI/TagPicker";
import { ExampleCard } from "@/components/HomePage/ExampleCard";
import { FullPageError } from "@/components/UI/FullPageError";

type BlockingError = {
  title: string;
  description: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function HeroSection() {
  const router = useRouter();
  const [repoInput, setRepoInput] = useState("");
  const [owner, setOwner] = useState<string | null>(null);
  const [repo, setRepo] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [blockingError, setBlockingError] = useState<BlockingError | null>(null);
  const runGenerateRef = useRef<() => Promise<void>>(async () => {});

  const applyRepo = useCallback((input: string) => {
    setRepoInput(input);
    setBlockingError(null);
    const parsed = parseRepoInput(input);
    if (!parsed) {
      setOwner(null);
      setRepo(null);
      setTags([]);
      setTagsError(null);
      return;
    }
    setOwner(parsed.owner);
    setRepo(parsed.repo);
  }, []);

  useEffect(() => {
    if (!owner || !repo) return;
    let cancelled = false;
    setTagsLoading(true);
    setTagsError(null);
    fetch(`/api/tags/${owner}/${repo}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          tags?: string[];
          error?: string;
          code?: string;
        };
        if (!res.ok) {
          if (res.status === 403 && data.code === ApiErrorCode.GITHUB_RATE_LIMIT) {
            if (!cancelled) {
              setBlockingError({
                title: "GitHub rate limit reached",
                description:
                  data.error ??
                  "Add a GITHUB_TOKEN in .env.local for higher limits (5,000 requests/hour).",
              });
            }
            return;
          }
          if (res.status === 404 && data.code === ApiErrorCode.REPO_NOT_FOUND) {
            if (!cancelled) {
              setBlockingError({
                title: "This repo is private or doesn't exist",
                description:
                  data.error ??
                  "RepoReel only works with public GitHub repositories.",
              });
            }
            return;
          }
          throw new Error(data.error ?? "Failed to load tags");
        }
        if (!cancelled) setTags(data.tags ?? []);
      })
      .catch((e: Error) => {
        if (!cancelled) setTagsError(e.message);
      })
      .finally(() => {
        if (!cancelled) setTagsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  useEffect(() => {
    if (tags.length === 0) return;
    setFrom((f) => (f && tags.includes(f) ? f : tags[0]));
    setTo((t) => {
      if (t && tags.includes(t)) return t;
      return tags.length > 1 ? tags[1] : tags[0];
    });
  }, [tags]);

  const handleExample = useCallback(
    (e: { owner: string; repo: string; from: string; to: string }) => {
      setRepoInput(`${e.owner}/${e.repo}`);
      setOwner(e.owner);
      setRepo(e.repo);
      setFrom(e.from);
      setTo(e.to);
    },
    [],
  );

  const runGenerate = useCallback(async () => {
    setFormError(null);
    setBlockingError(null);

    const parsed = parseRepoInput(repoInput.trim());
    if (!parsed) {
      setFormError(
        "Invalid repository format. Use https://github.com/owner/repo or owner/repo.",
      );
      return;
    }

    if (!from || !to) {
      setFormError("Pick both version tags.");
      return;
    }
    if (from === to) {
      setFormError("Choose two different tags.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: parsed.owner,
          repo: parsed.repo,
          from,
          to,
        }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        data?: CachedChangelogPayload;
        error?: string;
        code?: string;
      };

      if (res.status === 422 && body.code === ApiErrorCode.NO_COMMITS) {
        setBlockingError({
          title: "No changes found between these versions",
          description:
            body.error ??
            "Use the older tag as “From” and the newer as “To”, then try again.",
        });
        return;
      }

      if (res.status === 403 && body.code === ApiErrorCode.GITHUB_RATE_LIMIT) {
        setBlockingError({
          title: "GitHub rate limit reached",
          description:
            body.error ??
            "Add a GITHUB_TOKEN to your environment for higher limits.",
        });
        return;
      }

      if (res.status === 404 && body.code === ApiErrorCode.REPO_NOT_FOUND) {
        setBlockingError({
          title: "This repo is private or doesn't exist",
          description:
            body.error ??
            "RepoReel only works with public repositories and valid tags.",
        });
        return;
      }

      if (res.status === 503 && body.code === ApiErrorCode.GEMINI_FAILED) {
        setBlockingError({
          title: "AI generation failed",
          description: body.error ?? "Please try again in a moment.",
          secondaryLabel: "Retry",
          onSecondary: () => {
            setBlockingError(null);
            void runGenerateRef.current();
          },
        });
        return;
      }

      if (!res.ok) {
        throw new Error(body.error ?? "Could not generate changelog");
      }

      const payload = body.data;
      if (!payload) throw new Error("No data returned");

      try {
        sessionStorage.setItem(
          sessionPayloadKey(parsed.owner, parsed.repo, from, to),
          JSON.stringify(payload),
        );
      } catch {
        // storage full or disabled
      }

      const range = encodeTagRange(from, to);
      router.push(`/r/${parsed.owner}/${parsed.repo}/${range}`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [repoInput, from, to, router]);

  runGenerateRef.current = runGenerate;

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    await runGenerate();
  }

  if (blockingError) {
    return (
      <FullPageError
        title={blockingError.title}
        description={blockingError.description}
        actionLabel="Try another repo"
        secondaryLabel={blockingError.secondaryLabel}
        onSecondary={blockingError.onSecondary}
      />
    );
  }

  return (
    <>
      <LoadingStory open={submitting} />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center sm:text-left"
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400">
            <span aria-hidden>✦</span>
            Visual changelogs for developers
          </span>
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-indigo-brand">
            RepoReel
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            <span className="bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent">
              Your release, as a story.
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            Paste a public GitHub repo and pick two tags — get a visual changelog
            you can share.
          </p>
          <motion.div
            className="mx-auto mt-4 h-px max-w-[60px] bg-gradient-to-r from-indigo-500 to-transparent sm:mx-0"
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          onSubmit={onSubmit}
          className="relative mx-auto mt-10 flex max-w-2xl flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_-20px_rgba(99,102,241,0.3)] backdrop-blur-sm"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
            aria-hidden
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Repository</span>
            <input
              className="rounded-lg border border-white/10 bg-navy-deep/80 px-3 py-2.5 text-foreground outline-none placeholder:text-muted/60 focus:border-indigo-brand/60 focus:ring-2 focus:ring-indigo-brand/30"
              placeholder="https://github.com/facebook/react or facebook/react"
              value={repoInput}
              onChange={(e) => applyRepo(e.target.value)}
              autoComplete="off"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <TagPicker
              label="From tag"
              value={from}
              options={tags}
              onChange={setFrom}
              disabled={tagsLoading || !owner}
            />
            <TagPicker
              label="To tag"
              value={to}
              options={tags}
              onChange={setTo}
              disabled={tagsLoading || !owner}
            />
          </div>

          {tagsLoading ? (
            <p className="text-sm text-muted">Loading tags…</p>
          ) : null}
          {tagsError ? (
            <p className="text-sm text-cat-breaking">{tagsError}</p>
          ) : null}
          {formError ? (
            <p className="text-sm text-cat-breaking">{formError}</p>
          ) : null}

          <motion.button
            type="submit"
            disabled={submitting || !owner || tags.length < 2}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:from-indigo-500 hover:to-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-indigo-600 disabled:hover:to-indigo-500 disabled:hover:shadow-lg"
            whileTap={{ scale: 0.98 }}
          >
            Generate changelog
          </motion.button>
        </motion.form>

        <div className="mx-auto mt-12 max-w-3xl">
          <p className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-slate-500 sm:text-left">
            Try it with popular repos
          </p>
          <ExampleCard onPick={handleExample} />
        </div>
      </section>
    </>
  );
}
