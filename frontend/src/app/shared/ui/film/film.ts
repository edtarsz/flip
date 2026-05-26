import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { LucideStar } from '@lucide/angular';

@Component({
  selector: 'app-film',
  imports: [LucideStar, DecimalPipe, DatePipe],
  templateUrl: './film.html',
  styleUrl: './film.css',
})
export class Film {
  @Input() film!: FilmTMDB;
  @Input() loading: boolean = false;
}
