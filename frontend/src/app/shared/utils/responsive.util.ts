export function isViewportAtLeast(minWidth: number, ssrFallback = true): boolean {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= minWidth;
  }
  return ssrFallback;
}
