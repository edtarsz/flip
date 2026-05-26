import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, effect, untracked } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { LucideSearch, LucideX } from '@lucide/angular';
import { Button } from '@shared/ui/button/button';

@Component({
  selector: 'app-film-search-bar',
  imports: [FormRoot, FormField, LucideSearch, LucideX, Button],
  templateUrl: './film-search-bar.html',
})
export class FilmSearchBar implements OnChanges {
  @Input() searchModel: string = '';
  @Output() searchModelChange = new EventEmitter<string>();

  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() searchReset = new EventEmitter<void>();

  internalSearch = signal<{ query: string }>({ query: '' });

  searchForm = form(this.internalSearch, () => { }, {
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchModel']) {
      const newVal = changes['searchModel'].currentValue || '';
      if (newVal !== this.internalSearch().query) {
        this.internalSearch.set({ query: newVal });
      }
    }
  }

  onReset() {
    this.internalSearch.set({ query: '' });
    this.searchModelChange.emit('');
    this.searchReset.emit();
  }
}
