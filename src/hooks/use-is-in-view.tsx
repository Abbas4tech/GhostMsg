import { type UseInViewOptions, useInView } from "motion/react";
import { type Ref, useImperativeHandle, useRef } from "react";

interface UseIsInViewOptions {
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  inViewOnce?: boolean;
}

function useIsInView<T extends HTMLElement = HTMLElement>(
  ref: Ref<T>,
  options: UseIsInViewOptions = {}
) {
  const { inView, inViewOnce = false, inViewMargin = "0px" } = options;
  const localRef = useRef<T>(null);
  useImperativeHandle(ref, () => localRef.current as T);
  const inViewResult = useInView(localRef, {
    margin: inViewMargin,
    once: inViewOnce,
  });
  const isInView = !inView || inViewResult;
  return { isInView, ref: localRef };
}

export { type UseIsInViewOptions, useIsInView };
