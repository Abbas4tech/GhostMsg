"use client";

import {
  animate,
  type MotionValue,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import { useEffect, useRef } from "react";

import { Caret } from "@/components/animate/caret";
import { cn } from "@/lib/utils";

const MS = 1000;
const WORD_SEPARATOR = "|";

interface TypingRun {
  count: MotionValue<number>;
  deleteSpeed: number;
  list: readonly string[];
  loop: boolean;
  pause: number;
  signal: { cancelled: boolean; current?: ReturnType<typeof animate> };
  speed: number;
  wordIndex: MotionValue<number>;
}

/** Waits `ms`; resolves false if the run was cancelled meanwhile. */
const wait = (ms: number, signal: TypingRun["signal"]) =>
  new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(!signal.cancelled), ms);
  });

/** Animates the visible character count to `target` at `msPerChar`. */
const typeTo = async (run: TypingRun, target: number, msPerChar: number) => {
  const distance = Math.abs(target - run.count.get());
  if (distance === 0) {
    return;
  }
  run.signal.current = animate(run.count, target, {
    duration: (distance * msPerChar) / MS,
    ease: "linear",
  });
  await run.signal.current;
};

/**
 * Types the current word, holds, deletes it, then moves to the next word and
 * repeats. Each step schedules the next (no await-in-a-loop); cancelling the
 * signal ends the chain.
 */
const typeStep = async (run: TypingRun): Promise<void> => {
  const word = run.list[run.wordIndex.get()] ?? "";
  await typeTo(run, word.length, run.speed);
  const isLast = run.wordIndex.get() === run.list.length - 1;
  if (run.signal.cancelled || (!run.loop && isLast)) {
    return;
  }
  if (!(await wait(run.pause, run.signal))) {
    return;
  }
  await typeTo(run, 0, run.deleteSpeed);
  if (run.signal.cancelled) {
    return;
  }
  run.wordIndex.set((run.wordIndex.get() + 1) % run.list.length);
  return typeStep(run);
};

export interface TypeWriterProps {
  className?: string;
  /** Show the blinking caret. */
  cursor?: boolean;
  /** ms per character while deleting. */
  deleteSpeed?: number;
  /** Keep cycling through `words`. With one word, it types once and stops. */
  loop?: boolean;
  /** ms to hold a finished word before deleting it. */
  pause?: number;
  /** ms per character while typing. */
  speed?: number;
  /** ms before the first keystroke. */
  startDelay?: number;
  /** One phrase, or several to type, delete and replace in turn. */
  words: readonly string[];
}

/**
 * Typing effect. The visible text is a motion value (`useTransform`), so each
 * keystroke updates the DOM directly with no React re-render. The server and
 * first paint show the first phrase in full; typing starts once it is in view
 * and stops while off-screen. Screen readers get all phrases at once.
 */
function TypeWriter({
  className,
  cursor = true,
  deleteSpeed = 28,
  loop = true,
  pause = 1600,
  speed = 55,
  startDelay = 400,
  words,
}: TypeWriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref);
  const prefersReduced = useReducedMotion();
  // Depend on the words' content, not the array identity, so an inline
  // literal from a parent never restarts the loop on re-render.
  const wordsKey = words.join(WORD_SEPARATOR);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  const wordIndex = useMotionValue(0);
  const count = useMotionValue(words[0]?.length ?? 0);
  const display = useTransform(() =>
    (wordsRef.current[wordIndex.get()] ?? "").slice(0, Math.round(count.get()))
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: `wordsKey` stands in for `words` (content, not identity)
  useEffect(() => {
    const list = wordsRef.current;
    if (!isInView || prefersReduced || list.length === 0) {
      return;
    }
    const run: TypingRun = {
      count,
      deleteSpeed,
      list,
      loop: loop && list.length > 1,
      pause,
      signal: { cancelled: false },
      speed,
      wordIndex,
    };
    const start = async () => {
      if (!(await wait(startDelay, run.signal))) {
        return;
      }
      if (list.length === 1) {
        count.set(0);
      }
      await typeStep(run);
    };
    start().catch(() => undefined);
    return () => {
      run.signal.cancelled = true;
      run.signal.current?.stop();
    };
  }, [
    count,
    deleteSpeed,
    isInView,
    loop,
    pause,
    prefersReduced,
    speed,
    startDelay,
    wordIndex,
    wordsKey,
  ]);

  return (
    <span
      className={cn("inline-flex items-baseline", className)}
      data-slot="type-writer"
      ref={ref}
    >
      <span className="sr-only">{words.join(", ")}</span>
      <MotionSpan aria-hidden="true">{display}</MotionSpan>
      {cursor ? <Caret className="ml-0.5 translate-y-[0.1em]" /> : null}
    </span>
  );
}

export { TypeWriter };
