"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { encodeTagRange } from "@/lib/range";
import { parseRepoInput, sessionPayloadKey } from "@/lib/parseRepo";
import type { CachedChangelogPayload } from "@/lib/types";
import { LoadingStory } from "@/components/UI/LoadingStory";
import { TagPicker } from "@/components/UI/TagPicker";
import { ExampleCard } from "@/components/HomePage/ExampleCard";

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

  const applyRepo = useCallback((input: string) => {
    setRepoInput(input);
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
        const data = (await res.json()) as { tags?: string[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to load tags");
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

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (!owner || !repo) {
      setFormError("Enter a valid GitHub repo URL or owner/repo.");
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
        body: JSON.stringify({ owner, repo, from, to }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        data?: CachedChangelogPayload;
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Could not generate changelog");

      const payload = body.data;
      if (!payload) throw new Error("No data returned");

      try {
        sessionStorage.setItem(
          sessionPayloadKey(owner, repo, from, to),
          JSON.stringify(payload),
        );
      } catch {
        // storage full or disabled
      }

      const range = encodeTagRange(from, to);
      router.push(`/r/${owner}/${repo}/${range}`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <LoadingStory open={submitting} />
      <section className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center sm:text-left"
        >
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-indigo-brand">
            RepoReel
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Your release, as a story.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Paste a public GitHub repo and pick two tags — get a visual changelog
            you can share.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          onSubmit={onSubmit}
          className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/40"
        >
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
            className="rounded-xl bg-indigo-brand px-5 py-3 font-medium text-white shadow-lg shadow-indigo-brand/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            Generate changelog
          </motion.button>
        </motion.form>

        <div>
          <p className="mb-3 text-center text-sm text-muted sm:text-left">
            Try an example
          </p>
          <ExampleCard onPick={handleExample} />
        </div>
      </section>
    </>
  );
}
