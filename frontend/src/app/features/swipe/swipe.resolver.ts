import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SwipeService } from '@core/services/swipe.service';
import { LoadingService } from '@core/services/loading.service';

export const swipeResolver: ResolveFn<boolean> = async () => {
  const swipeService = inject(SwipeService);
  const loadingService = inject(LoadingService);
  
  if (swipeService.recommendations().length < 10) {
    loadingService.start();
    await swipeService.getRecommendations();
  }
  return true;
};
