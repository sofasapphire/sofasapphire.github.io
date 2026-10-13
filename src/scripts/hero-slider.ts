/** Слайдер первого экрана: плавная смена кадров (интервал — data-interval на [data-hero]). */
const hero = document.querySelector<HTMLElement>('[data-hero]');
const slides = hero?.querySelectorAll<HTMLImageElement>('.hero__slide') ?? [];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero && slides.length > 1 && !reducedMotion) {
  // Следующие кадры грузим сразу после первого, чтобы смена была без пауз.
  slides.forEach((img) => (img.loading = 'eager'));

  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, Number(hero.dataset.interval));
}

export {}; // отдельный модуль: свои переменные не пересекаются с другими скриптами
