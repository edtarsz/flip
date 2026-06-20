import { Component, input } from '@angular/core';

@Component({
  selector: 'app-person-item',
  imports: [],
  templateUrl: './person-item.html',
  styleUrl: './person-item.css',
})
export class PersonItem {
  name = input.required<string>();

  getInitials(): string {
    return this.name()
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }
}
