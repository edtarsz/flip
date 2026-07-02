import { Component, signal, effect, untracked, input, output } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { LucideSearch, LucideX } from '@lucide/angular';
import { Button } from '@shared/ui/button/button';

@Component({
  selector: 'app-film-search-bar',
  imports: [FormRoot, FormField, LucideSearch, LucideX, Button],
  templateUrl: './film-search-bar.html',
})
export class FilmSearchBar {
  searchModel = input<string>('');
  searchModelChange = output<string>();
  hasActiveFilters = input<boolean>(false);

  searchSubmitted = output<string>();
  searchReset = output<void>();
  toggleFilters = output<void>();

  internalSearch = signal<{ query: string }>({ query: '' });

  searchForm = form(this.internalSearch, () => {}, {
    submission: {
      action: async (fields) => {
        const query = fields().value().query || '';
        this.searchModelChange.emit(query);
        this.searchSubmitted.emit(query);
      },
    },
  });

  constructor() {
    effect(() => {
      const query = this.internalSearch().query;
      untracked(() => {
        this.searchModelChange.emit(query);
      });
    });

    effect(() => {
      const newVal = this.searchModel() || '';
      untracked(() => {
        if (newVal !== this.internalSearch().query) {
          this.internalSearch.set({ query: newVal });
        }
      });
    });
  }

  onReset() {
    this.internalSearch.set({ query: '' });
    this.searchModelChange.emit('');
    this.searchReset.emit();
  }
}
