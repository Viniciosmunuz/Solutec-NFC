"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * `false` durante o SSR e a primeira renderização, `true` depois da
 * hidratação. Usado por componentes que dependem de `document` (portais).
 *
 * Com `useSyncExternalStore` em vez de `useState` + `useEffect`, o React não
 * precisa de uma renderização extra em cascata.
 */
export function useIsMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
