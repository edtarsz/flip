import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [NgClass, LucideSun, LucideMoon],
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  private themeService = inject(ThemeService);
  readonly currentTheme = this.themeService.theme;

  toggle() {
    this.themeService.toggleTheme();
  }
}
