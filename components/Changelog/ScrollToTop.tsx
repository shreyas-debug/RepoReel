"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 320;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-24 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-navy-deep/95 text-foreground shadow-lg backdrop-blur-sm transition hover:border-indigo-brand/40 hover:bg-white/10 sm:bottom-24 sm:right-6 sm:h-10 sm:w-10"
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-indigo-brand sm:h-5 sm:w-5"
            aria-hidden
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
