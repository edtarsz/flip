import { Component, input, output } from '@angular/core';
import { animateRipple } from '@shared/utils/animation.util';
import { LucideListFilter, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-floating-filter-button',
  imports: [LucideListFilter, LucideX],
  templateUrl: './floating-filter-button.html',
  host: {
    class: 'absolute'
  }
})
export class FloatingFilterButton {
  hasActiveFilters = input.required<boolean>();
  isVisibleSidebar = input.required<boolean>();
  toggleSidebar = output<void>();

  onClick(event: Event) {
    animateRipple(event);
    this.toggleSidebar.emit();
  }
}
