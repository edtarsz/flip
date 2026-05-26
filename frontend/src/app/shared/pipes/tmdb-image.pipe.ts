import { Pipe, PipeTransform } from '@angular/core';

export function getTmdbImageUrl(path: string | null | undefined, size: string = 'w342'): string {
  if (!path) {
    return '/assets/images/film-placeholder.jpg';
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

@Pipe({
  name: 'tmdbImage',
  standalone: true
})
export class TmdbImagePipe implements PipeTransform {
  transform(path: string | null | undefined, size: string = 'w342'): string {
    return getTmdbImageUrl(path, size);
  }
}
