/* lib/useOnce.ts */
import { useEffect, useRef } from 'react';

export function useOnce(fn: () => void) {
  const ref = useRef(false);
  useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      fn();
    }
  }, []);
}