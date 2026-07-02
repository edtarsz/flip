import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button-desktop-key',
  imports: [],
  templateUrl: './button-desktop-key.html',
  styleUrl: './button-desktop-key.css',
  host: {
    class: 'aspect-square block',
  },
})
export class ButtonDesktopKey {
  keyLabel = input.required<string>();
}
