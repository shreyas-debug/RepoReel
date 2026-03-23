"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section id is most visible in the viewport (for scrollspy nav).
 */
export function useActiveSection(sectionIds: string[]) {
  const key = sectionIds.join("\0");
  const [activeId, setActiveId] = useState<string | null>(
    sectionIds[0] ?? null,
  );

  useEffect(() => {
    if (sectionIds.length === 0) return;
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const best = intersecting.sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio,
        )[0];
        const id = best?.target.id;
        if (id) setActiveId(id);
      },
      {
        rootMargin: "-12% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
