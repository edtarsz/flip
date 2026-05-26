import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Separator } from "@shared/ui/separator/separator";
import { TmdbImagePipe } from "../../../shared/pipes/tmdb-image.pipe";

@Component({
  selector: 'app-film-details',
  imports: [Separator, TmdbImagePipe],
  templateUrl: './film-details.html',
  styleUrl: './film-details.css',
})
export class FilmDetails {
  private route = inject(ActivatedRoute);

  film = toSignal(
    this.route.data.pipe(map(data => data['film'] as any))
  );

  constructor() {
    console.log(this.film());
  }
}
