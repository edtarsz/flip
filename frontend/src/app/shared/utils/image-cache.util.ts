export const loadedImagesCache = new Set<string>();

export function isImageLoaded(url: string | null | undefined): boolean {
  return url ? loadedImagesCache.has(url) : false;
}

export function markImageLoaded(url: string | null | undefined): void {
  if (url) {
    loadedImagesCache.add(url);
  }
}
