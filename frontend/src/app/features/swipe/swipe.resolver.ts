import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SwipeService } from '@core/services/swipe.service';
import { LoadingService } from '@core/services/loading.service';

export const swipeResolver: ResolveFn<boolean> = async () => {
  const swipeService = inject(SwipeService);
  const loadingService = inject(LoadingService);

  const remaining = swipeService.recommendations().length - swipeService.currentIndex();

  if (remaining === 0) {
    loadingService.start();
    await swipeService.getRecommendations(10);
  }
  return true;
};
