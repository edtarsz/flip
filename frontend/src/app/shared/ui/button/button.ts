import { Component, input } from '@angular/core';
import { LucideCornerDownLeft, LucideSearch, LucideEye } from '@lucide/angular';

export type ButtonIcon = 'corner-down-left' | 'search' | 'eye' | 'none';

@Component({
  selector: 'app-button',
  imports: [LucideCornerDownLeft, LucideSearch, LucideEye],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  label = input.required<string>();
  size = input<'w-full' | 'w-fit'>('w-fit');
  icon = input<ButtonIcon>();
  disabled = input<boolean>(false);
}
