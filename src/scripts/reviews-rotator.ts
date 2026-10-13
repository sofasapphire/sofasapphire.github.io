/** Отзывы на главной: случайный выбор из колоды и плавная смена каждые data-interval мс. */
const root = document.querySelector<HTMLElement>('[data-reviews]');

if (root) {
  const slots = [...root.querySelectorAll<HTMLElement>('.slot')];
  const total = slots[0]?.children.length ?? 0;
  const interval = Number(root.dataset.interval);
  let deck: number[] = [];
  let current: number[] = [];

  /** Перемешивание Фишера — Йейтса */
  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  /**
   * Следующие отзывы из перетасованной колоды. Колода кончилась — тасуем заново.
   * Отзыв, который сейчас на экране, откладывается в конец колоды, чтобы не мелькнуть
   * два раза подряд (если отзывов мало и иначе нельзя — показываем).
   */
  const draw = (count: number) => {
    const picked: number[] = [];
    let skips = 0;
    while (picked.length < count) {
      if (deck.length === 0) deck = shuffle([...Array(total).keys()]);
      const next = deck.shift()!;
      if (picked.includes(next)) continue;
      if (current.includes(next) && skips < total) {
        deck.push(next);
        skips++;
        continue;
      }
      picked.push(next);
    }
    return picked;
  };

  const show = (indexes: number[]) => {
    slots.forEach((slot, s) =>
      [...slot.children].forEach((q, i) => {
        const active = i === indexes[s];
        q.classList.toggle('is-active', active);
        if (active) q.removeAttribute('aria-hidden');
        else q.setAttribute('aria-hidden', 'true');
      }),
    );
    current = indexes;
  };

  // Сразу при загрузке — случайные отзывы (без анимации: блок ещё не проявился)
  show(draw(slots.length));

  if (total > slots.length) {
    let paused = false;
    root.addEventListener('mouseenter', () => (paused = true));
    root.addEventListener('mouseleave', () => (paused = false));
    setInterval(() => {
      if (!paused && !document.hidden) show(draw(slots.length));
    }, interval);
  }
}

export {}; // отдельный модуль: свои переменные не пересекаются с другими скриптами
