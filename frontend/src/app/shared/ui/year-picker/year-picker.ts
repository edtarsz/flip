import { Component, computed, model, signal } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'app-year-picker',
  imports: [LucideChevronLeft, LucideChevronRight],
  templateUrl: './year-picker.html',
  styleUrl: './year-picker.css',
})
export class YearPicker {
  selectedYear = model<number | null>(null);
  isOpen = signal(false);

  private pageStart = signal(Math.floor(new Date().getFullYear() / 12) * 12);

  years = computed(() => {
    const start = this.pageStart();
    return Array.from({ length: 12 }, (_, i) => start + i);
  });

  rangeLabel = computed(() => {
    const start = this.pageStart();
    return `${start} – ${start + 11}`;
  });

  currentYear = new Date().getFullYear();

  toggle() {
    this.isOpen.update(v => !v);
  }

  select(year: number) {
    this.selectedYear.set(year);
    this.isOpen.set(false);
  }

  prevPage() {
    this.pageStart.update(v => v - 12);
  }

  nextPage() {
    this.pageStart.update(v => v + 12);
  }

  clear() {
    this.selectedYear.set(null);
    this.isOpen.set(false);
  }
}
