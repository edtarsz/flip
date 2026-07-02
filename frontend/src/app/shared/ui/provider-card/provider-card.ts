import { Component, input } from '@angular/core';
import { WatchProviderItem } from '@shared/utils/watch-providers.util';
import { TmdbImagePipe } from '@shared/pipes/tmdb-image.pipe';

@Component({
  selector: 'app-provider-card',
  imports: [TmdbImagePipe],
  templateUrl: './provider-card.html',
  styleUrl: './provider-card.css',
})
export class ProviderCard {
  provider = input.required<WatchProviderItem>();
}
