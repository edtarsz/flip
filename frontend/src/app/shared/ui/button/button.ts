import { Component, Input } from '@angular/core';
import { LucideCornerDownLeft, LucideSearch, LucideEye } from '@lucide/angular';

export type ButtonIcon = 'corner-down-left' | 'search' | 'eye' | 'none';

@Component({
  selector: 'app-button',
  imports: [LucideCornerDownLeft, LucideSearch, LucideEye],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input({ required: true }) label!: string;
  @Input({ required: false }) size: 'w-full' | 'w-fit' = 'w-fit';
  @Input({ required: false }) type: 'button' | 'submit' | 'reset' = 'button';
  @Input({ required: false }) icon?: ButtonIcon;
  @Input({ required: false }) variant: 'primary' | 'secondary' = 'primary';
}
