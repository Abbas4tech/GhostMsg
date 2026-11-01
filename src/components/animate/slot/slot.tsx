"use client";

import { type HTMLMotionProps, isMotionComponent } from "motion/react";
import { create as createMotionComponent } from "motion/react-m";
import {
  type CSSProperties,
  type ElementType,
  isValidElement,
  type ReactElement,
  type Ref,
  type RefCallback,
  type RefObject,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";

type AnyProps = Record<string, unknown>;

type DOMMotionProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLMotionProps<keyof HTMLElementTagNameMap>,
  "ref"
> & { ref?: Ref<T> };

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: ReactElement })
  | (Base & { asChild?: false | undefined });

type SlotProps<T extends HTMLElement = HTMLElement> = DOMMotionProps<T>;

/**
 * One motion component per element type for the whole app. Creating it per
 * Slot instance (the old `useMemo`) gave every wrapped Button its own
 * component type: more memory, and a remount if the memo ever reset.
 */
const motionComponentCache = new Map<ElementType, ElementType>();

function toMotionComponent(type: ElementType): ElementType {
  if (typeof type === "object" && type !== null && isMotionComponent(type)) {
    return type;
  }
  let component = motionComponentCache.get(type);
  if (!component) {
    component = createMotionComponent(type) as ElementType;
    motionComponentCache.set(type, component);
  }
  return component;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    (ref as RefObject<T | null>).current = node;
  }
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      assignRef(ref, node);
    }
  };
}

const HANDLER_PREFIX = /^on[A-Z]/;

/** Slot props win, but class names join, styles merge and handlers compose. */
function mergeProps<T extends HTMLElement>(
  childProps: AnyProps,
  slotProps: DOMMotionProps<T>
): AnyProps {
  const merged: AnyProps = { ...childProps, ...slotProps };

  for (const key of Object.keys(slotProps)) {
    const childHandler = childProps[key];
    const slotHandler = (slotProps as AnyProps)[key];
    if (
      HANDLER_PREFIX.test(key) &&
      typeof childHandler === "function" &&
      typeof slotHandler === "function"
    ) {
      merged[key] = (...args: unknown[]) => {
        childHandler(...args);
        slotHandler(...args);
      };
    }
  }

  if (childProps.className || slotProps.className) {
    merged.className = cn(
      childProps.className as string,
      slotProps.className as string
    );
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as CSSProperties),
      ...(slotProps.style as CSSProperties),
    };
  }

  return merged;
}

/**
 * Renders its single child as a motion component and merges the motion props
 * onto it, so `asChild` wrappers add no DOM node.
 */
function Slot<T extends HTMLElement = HTMLElement>({
  children,
  ref,
  ...props
}: SlotProps<T>) {
  const isElement = isValidElement(children);
  const childRef = isElement
    ? ((children.props as AnyProps).ref as Ref<T> | undefined)
    : undefined;
  const mergedRef = useMemo(() => mergeRefs(childRef, ref), [childRef, ref]);

  if (!isElement) {
    return null;
  }

  const Base = toMotionComponent(children.type as ElementType);
  const { ref: _ignored, ...childProps } = (children.props || {}) as AnyProps;
  const mergedProps = mergeProps(childProps, props);

  return <Base {...mergedProps} ref={mergedRef} />;
}

export {
  type AnyProps,
  type DOMMotionProps,
  Slot,
  type SlotProps,
  type WithAsChild,
};
