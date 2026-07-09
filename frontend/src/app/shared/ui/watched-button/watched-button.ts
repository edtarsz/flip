import { Component, input, output, signal } from '@angular/core';
import { LucideCheck, LucideEye } from '@lucide/angular';
import { ButtonFeedback } from '../button-feedback/button-feedback';
import { FilmTier } from '@core/repositories/review.repository';

@Component({
  selector: 'app-watched-button',
  imports: [LucideEye, LucideCheck, ButtonFeedback],
  templateUrl: './watched-button.html'
})
export class WatchedButton {
  isSeen = input<boolean>(false);
  watched = output<FilmTier>();
  
  isTierOpen = signal<boolean>(false);

  toggleTier() {
    this.isTierOpen.set(!this.isTierOpen());
  }

  onWatched(tier: FilmTier) {
    this.watched.emit(tier);
    this.isTierOpen.set(false);
  }
}
