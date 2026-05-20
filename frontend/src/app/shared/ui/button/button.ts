import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input({ required: true }) label!: string;
  @Input({ required: false }) size: 'w-full' | 'w-fit' = 'w-fit';
}
