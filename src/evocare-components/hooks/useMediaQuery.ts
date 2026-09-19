import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean | null {
  // null = not yet measured (before first useEffect on client)
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();                                   // read real value immediately
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
