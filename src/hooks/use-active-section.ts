"use client";

import { useEffect, useState } from "react";

/**
 * Id of the section nearest the top of the viewport, for "On this page"
 * navigation. Falls back to the first id until the observer reports.
 */
export function useActiveSection(ids: readonly string[]): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(ids[0]);
  const key = ids.join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const sectionIds = key.split("|");
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        const first = sectionIds.find((id) => visible.has(id));
        if (first) {
          setActiveId(first);
        }
      },
      { rootMargin: "-10% 0px -55% 0px" }
    );
    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }
    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
