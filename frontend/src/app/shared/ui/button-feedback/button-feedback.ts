import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-button-feedback',
  templateUrl: './button-feedback.html',
  styleUrl: './button-feedback.css',
  host: {
    'class': 'absolute bottom-0 right-0 z-10 flex justify-center items-center rounded-full border border-(--color-gray)/20 cursor-pointer',
    '[class.active]': 'isSeen()',
    '[class.btn-good]': "type() === 'good'",
    '[class.btn-meh]': "type() === 'meh'",
    '[class.btn-bad]': "type() === 'bad'",
  }
})
export class ButtonFeedback {
  type = input.required<'good' | 'meh' | 'bad'>();
  isSeen = input<boolean>(false);
  keyBadge = input.required<string>();

  label = computed(() => {
    switch (this.type()) {
      case 'good': return 'Good!';
      case 'meh':  return 'Meh!';
      case 'bad':  return 'Bad!';
    }
  });
}
