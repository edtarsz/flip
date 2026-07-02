import { Pipe, PipeTransform } from '@angular/core';

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

@Pipe({
  name: 'runtime',
  standalone: true,
})
export class RuntimePipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    return formatRuntime(minutes);
  }
}
