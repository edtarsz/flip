import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trees',
  imports: [RouterLink],
  templateUrl: './trees.html',
  styleUrl: './trees.css',
})
export class Trees {
  readonly codes = new Map<string, string>([
    ['marvel-studios', '84979'],
    ['star-wars', '8136'],
  ]);

  getRoute(key: string): string {
    return `/trees/${this.codes.get(key)}`;
  }
}
