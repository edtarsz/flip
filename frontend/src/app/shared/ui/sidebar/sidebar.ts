import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Separator } from '@shared/ui/separator/separator';
import { LucideX, LucideChevronsDownUp, LucideChevronsUpDown } from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, Separator, LucideX, LucideChevronsDownUp, LucideChevronsUpDown],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  title = input.required<string>();
  position = input<'left' | 'right'>('left');
  variant = input<'overlay' | 'responsive'>('overlay');
  isOpen = input<boolean>(false);
  hasNotification = input<boolean>(false);

  close = output<void>();
  toggle = output<void>();

  onClose() {
    this.close.emit();
  }

  onToggle() {
    this.toggle.emit();
  }
}
