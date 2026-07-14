import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [],
  template: '',
  host: {
    class: 'block animate-pulse bg-(--color-gray-dark) rounded-md',
  },
})
export class Skeleton {}
