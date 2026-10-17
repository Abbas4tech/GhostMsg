import { useCallback, useRef, useState } from "react";

interface CommonControlledStateProps<T> {
  defaultValue?: T;
  value?: T;
}

export function useControlledState<T, Rest extends unknown[] = []>(
  props: CommonControlledStateProps<T> & {
    onChange?: (value: T, ...args: Rest) => void;
  }
): readonly [T, (next: T, ...args: Rest) => void] {
  const { value, defaultValue, onChange } = props;
  const isControlled = value !== undefined;

  const [uncontrolledState, setUncontrolledState] = useState<T>(
    defaultValue as T
  );

  const state = isControlled ? value : uncontrolledState;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setState = useCallback(
    (next: T, ...args: Rest) => {
      if (!isControlled) {
        setUncontrolledState(next);
      }
      onChangeRef.current?.(next, ...args);
    },
    [isControlled]
  );

  return [state, setState] as const;
}
