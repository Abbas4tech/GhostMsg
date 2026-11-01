"use client";

import {
  type HTMLMotionProps,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { div as MotionDiv } from "motion/react-m";
import { type PointerEvent, type ReactNode, useCallback } from "react";

import { useRichMotion } from "@/hooks/use-rich-motion";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PERSPECTIVE = 900;
const CENTER = 0.5;

export interface TiltProps
  extends Omit<HTMLMotionProps<"div">, "children" | "style"> {
  children?: ReactNode;
  /** Adds a soft light that follows the pointer. */
  glare?: boolean;
  /** Maximum tilt in degrees. */
  max?: number;
}

/**
 * 3D tilt toward the pointer, springing flat on leave (Story Card previews,
 * the landing showcase). Motion values only: no re-render per pointer move.
 * Rich motion only; otherwise a plain wrapper.
 */
function Tilt({
  children,
  className,
  glare = false,
  max = 8,
  ...props
}: TiltProps) {
  const isRich = useRichMotion();
  const px = useMotionValue(CENTER);
  const py = useMotionValue(CENTER);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring.soft);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring.soft);
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.28), transparent 55%)`;

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      px.set((event.clientX - rect.left) / rect.width);
      py.set((event.clientY - rect.top) / rect.height);
    },
    [px, py]
  );
  const handlePointerLeave = useCallback(() => {
    px.set(CENTER);
    py.set(CENTER);
  }, [px, py]);

  if (!isRich) {
    return (
      <div className={className} data-slot="tilt">
        {children}
      </div>
    );
  }
  return (
    <MotionDiv
      className={cn("relative", className)}
      data-slot="tilt"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={{ rotateX, rotateY, transformPerspective: PERSPECTIVE }}
      {...props}
    >
      {children}
      {glare ? (
        <MotionDiv
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBackground }}
        />
      ) : null}
    </MotionDiv>
  );
}

export { Tilt };
