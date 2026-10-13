/**
 * Плавное появление при прокрутке — как эффект «cascade» на nadia-vaisse.com.
 *
 * Любой элемент с атрибутом data-reveal проявляется (fade + лёгкий подъём),
 * когда попадает в экран. Элементы, появившиеся одновременно, идут каскадом
 * с небольшой задержкой друг за другом. Стили — в styles/motion.css.
 *
 * Если у человека в системе отключены анимации — всё видно сразу.
 */

const STEP_MS = 110; // задержка между соседями в каскаде
const MAX_DELAY_MS = 550; // чтобы длинные ряды не ждали слишком долго

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');

if (reducedMotion || !('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      const appearing = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

      appearing.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${Math.min(i * STEP_MS, MAX_DELAY_MS)}ms`);
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => observer.observe(el));
}

export {}; // отдельный модуль: свои переменные не пересекаются с другими скриптами
