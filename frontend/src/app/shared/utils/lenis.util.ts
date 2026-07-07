import Lenis, { LenisOptions } from 'lenis';

export const createLenis = (options?: LenisOptions) => {
  const isWrapper = !!(options?.wrapper);
  return new Lenis({
    syncTouch: !isWrapper,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    ...options,
  });
};
