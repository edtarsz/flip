import { Component, input, signal } from '@angular/core';
import { LucideCornerDownLeft, LucideSearch, LucideEye } from '@lucide/angular';

export type ButtonIcon = 'corner-down-left' | 'search' | 'eye' | 'play' | 'none';

@Component({
  selector: 'app-button',
  imports: [LucideCornerDownLeft, LucideSearch, LucideEye],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {
  label = input.required<string>();
  size = input<'w-full' | 'w-fit'>('w-fit');
  icon = input<ButtonIcon>();
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('submit');

  enableTransition = signal(false);

  ngOnInit() {
    setTimeout(() => {
      this.enableTransition.set(true);
    }, 50);
  }
}
