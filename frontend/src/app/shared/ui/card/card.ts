import { Component, input } from '@angular/core';
import { Separator } from "../separator/separator";
@Component({
  selector: 'app-card',
  imports: [Separator],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  title = input.required<string>();
  isEmpty = input<boolean>(false);
}
