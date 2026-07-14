import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-button-feedback',
  templateUrl: './button-feedback.html',
  styleUrl: './button-feedback.css',
  host: {
    class:
      'absolute bottom-0 right-0 z-10 flex justify-center items-center rounded-full border border-(--color-gray-dark) cursor-pointer',
    '[class.active]': 'isTierOpen()',
    '[class.btn-amazing]': "type() === 'amazing'",
    '[class.btn-good]': "type() === 'good'",
    '[class.btn-meh]': "type() === 'meh'",
    '[class.btn-bad]': "type() === 'bad'",
  },
})
export class ButtonFeedback {
  type = input.required<'amazing' | 'good' | 'meh' | 'bad'>();
  isTierOpen = input<boolean>(false);
  keyBadge = input<string>();

  label = computed(() => {
    switch (this.type()) {
      case 'amazing':
        return 'Amazing!';
      case 'good':
        return 'Good!';
      case 'meh':
        return 'Meh!';
      case 'bad':
        return 'Bad!';
    }
  });
}
