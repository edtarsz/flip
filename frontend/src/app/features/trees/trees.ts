import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderMobile } from "@shared/ui/headers/header-mobile/header-mobile";

@Component({
  selector: 'app-trees',
  imports: [RouterLink, HeaderMobile],
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
