import { useEffect, useState } from "react";

/** True only after client hydration — gates SSR-unsafe widgets like charts. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
