"use client";

import {
  type DependencyList,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface AutoHeightOptions {
  includeParentBox?: boolean;
  includeSelfBox?: boolean;
}

function getElementBoxExtra(el: HTMLElement | null, include?: boolean): number {
  if (!(include && el)) {
    return 0;
  }
  const cs = getComputedStyle(el);
  if (cs.boxSizing !== "border-box") {
    return 0;
  }
  const paddingY =
    (Number.parseFloat(cs.paddingTop || "0") || 0) +
    (Number.parseFloat(cs.paddingBottom || "0") || 0);
  const borderY =
    (Number.parseFloat(cs.borderTopWidth || "0") || 0) +
    (Number.parseFloat(cs.borderBottomWidth || "0") || 0);
  return paddingY + borderY;
}

export function useAutoHeight<T extends HTMLElement = HTMLDivElement>(
  deps: DependencyList = [],
  options: AutoHeightOptions = {
    includeParentBox: true,
    includeSelfBox: false,
  }
) {
  const ref = useRef<T | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return 0;
    }

    const base = el.getBoundingClientRect().height || 0;
    const parentExtra = getElementBoxExtra(
      el.parentElement,
      options.includeParentBox
    );
    const selfExtra = getElementBoxExtra(el, options.includeSelfBox);
    const extra = parentExtra + selfExtra;

    const dpr =
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    return Math.ceil((base + extra) * dpr) / dpr;
  }, [options.includeParentBox, options.includeSelfBox]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    setHeight(measure());

    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }

    const ro = new ResizeObserver(() => {
      const next = measure();
      requestAnimationFrame(() => setHeight(next));
    });

    ro.observe(el);
    if (options.includeParentBox && el.parentElement) {
      ro.observe(el.parentElement);
    }

    roRef.current = ro;

    return () => {
      ro.disconnect();
      roRef.current = null;
    };
  }, [measure, options.includeParentBox, ...deps]);

  useLayoutEffect(() => {
    if (height === 0) {
      const next = measure();
      if (next !== 0) {
        setHeight(next);
      }
    }
  }, [height, measure]);

  return { ref, height } as const;
}
