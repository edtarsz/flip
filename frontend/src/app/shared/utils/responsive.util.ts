const ViewportSizes = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
};

type ViewportKey = keyof typeof ViewportSizes;

export function isViewportAtLeast(minWidth: ViewportKey, ssrFallback = true): boolean {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= ViewportSizes[minWidth];
  }
  return ssrFallback;
}
