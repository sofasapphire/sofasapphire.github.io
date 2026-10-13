/** Страница «Портфолио»: фильтр съёмок по виду, выбор сохраняется в адресе (?vid=). */
const nav = document.querySelector<HTMLElement>('[data-filters]');
const items = document.querySelectorAll<HTMLElement>('[data-shoot-grid] > li');
const chips = nav?.querySelectorAll<HTMLButtonElement>('[data-filter]') ?? [];
const PARAM = 'vid';

function apply(slug: string) {
  // Неизвестный вид в адресе — показываем всё
  if (slug && ![...chips].some((c) => c.dataset.filter === slug)) slug = '';
  items.forEach((li) => (li.hidden = Boolean(slug) && li.dataset.category !== slug));
  chips.forEach((chip) => {
    const active = chip.dataset.filter === slug;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

chips.forEach((chip) =>
  chip.addEventListener('click', () => {
    const slug = chip.dataset.filter ?? '';
    apply(slug);
    const url = new URL(location.href);
    if (slug) url.searchParams.set(PARAM, slug);
    else url.searchParams.delete(PARAM);
    history.replaceState(null, '', url);
  }),
);

apply(new URLSearchParams(location.search).get(PARAM) ?? '');

export {}; // отдельный модуль: свои переменные не пересекаются с другими скриптами
