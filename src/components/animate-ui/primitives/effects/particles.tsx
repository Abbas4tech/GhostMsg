"use client";

import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import type * as React from "react";

import {
  Slot,
  type WithAsChild,
} from "@/components/animate-ui/primitives/animate/slot";
import { type UseIsInViewOptions, useIsInView } from "@/hooks/use-is-in-view";
import { getStrictContext } from "@/lib/get-strict-context";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

interface ParticlesContextType {
  animate: boolean;
  isInView: boolean;
}

const [ParticlesProvider, useParticles] =
  getStrictContext<ParticlesContextType>("ParticlesContext");

type ParticlesProps = WithAsChild<
  Omit<HTMLMotionProps<"div">, "children"> & {
    animate?: boolean;
    children: React.ReactNode;
  } & UseIsInViewOptions
>;

function Particles({
  ref,
  animate = true,
  asChild = false,
  inView = false,
  inViewMargin = "0px",
  inViewOnce = true,
  children,
  style,
  ...props
}: ParticlesProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLDivElement>,
    { inView, inViewOnce, inViewMargin }
  );

  const Component = asChild ? Slot : motion.div;

  return (
    <ParticlesProvider value={{ animate, isInView }}>
      <Component
        ref={localRef}
        style={{ position: "relative", ...style }}
        {...props}
      >
        {children}
      </Component>
    </ParticlesProvider>
  );
}

type ParticlesEffectProps = Omit<HTMLMotionProps<"div">, "children"> & {
  side?: Side;
  align?: Align;
  count?: number;
  radius?: number;
  spread?: number;
  duration?: number;
  holdDelay?: number;
  sideOffset?: number;
  alignOffset?: number;
  delay?: number;
};

function getAlignPercent(align: Align): string {
  if (align === "start") {
    return "0%";
  }
  if (align === "end") {
    return "100%";
  }
  return "50%";
}

function getTopOffset(
  isVertical: boolean,
  side: Side,
  alignPct: string,
  sideOffset: number,
  alignOffset: number
): string {
  if (!isVertical) {
    return `calc(${alignPct} + ${alignOffset}px)`;
  }
  if (side === "top") {
    return `calc(0% - ${sideOffset}px)`;
  }
  return `calc(100% + ${sideOffset}px)`;
}

function getLeftOffset(
  isVertical: boolean,
  side: Side,
  alignPct: string,
  sideOffset: number,
  alignOffset: number
): string {
  if (isVertical) {
    return `calc(${alignPct} + ${alignOffset}px)`;
  }
  if (side === "left") {
    return `calc(0% - ${sideOffset}px)`;
  }
  return `calc(100% + ${sideOffset}px)`;
}

function ParticlesEffect({
  side = "top",
  align = "center",
  count = 6,
  radius = 30,
  spread = 360,
  duration = 0.8,
  holdDelay = 0.05,
  sideOffset = 0,
  alignOffset = 0,
  delay = 0,
  transition,
  style,
  ...props
}: ParticlesEffectProps) {
  const { animate, isInView } = useParticles();

  const isVertical = side === "top" || side === "bottom";
  const alignPct = getAlignPercent(align);
  const top = getTopOffset(isVertical, side, alignPct, sideOffset, alignOffset);
  const left = getLeftOffset(
    isVertical,
    side,
    alignPct,
    sideOffset,
    alignOffset
  );

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    top,
    left,
    transform: "translate(-50%, -50%)",
  };

  const angleStep = (spread * (Math.PI / 180)) / Math.max(1, count - 1);

  const particles = Array.from({ length: count }, (_, index) => {
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return {
      id: `particle-angle-${angle.toFixed(4)}`,
      x,
      y,
      itemDelay: delay + index * holdDelay,
    };
  });

  return (
    <AnimatePresence>
      {animate &&
        isInView &&
        particles.map((p) => (
          <motion.div
            animate={{
              x: `${p.x}px`,
              y: `${p.y}px`,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            initial={{ scale: 0, opacity: 0 }}
            key={p.id}
            style={{ ...containerStyle, ...style }}
            transition={{
              duration,
              delay: p.itemDelay,
              ease: "easeOut",
              ...transition,
            }}
            {...props}
          />
        ))}
    </AnimatePresence>
  );
}

export {
  Particles,
  ParticlesEffect,
  type ParticlesEffectProps,
  type ParticlesProps,
};
