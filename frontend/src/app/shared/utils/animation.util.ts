export function animateRipple(eventOrElement: Event | HTMLElement) {
  const el =
    eventOrElement instanceof Event ? (eventOrElement.currentTarget as HTMLElement) : eventOrElement;

  if (!el) return;

  const ripple = el.querySelector('.ripple-layer');
  if (ripple) {
    ripple.animate([{ opacity: 0 }, { opacity: 0.3, offset: 0.1 }, { opacity: 0 }], {
      duration: 500,
      easing: 'ease-out',
    });
  }
}
