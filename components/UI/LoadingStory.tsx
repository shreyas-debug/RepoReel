"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Fetching commits…",
  "Reading the diff…",
  "Writing your release story…",
  "Almost there…",
];

export function LoadingStory({ open }: { open: boolean }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => {
      setI((n) => (n + 1) % MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-12 w-12 rounded-full border-2 border-indigo-brand border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              className="mt-8 max-w-sm text-center font-display text-lg text-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {MESSAGES[i]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
