/**
 * Переключатель палитр A/B/C — инструмент выбора цветов.
 * Подключается только при `npm run dev`: компонент PaletteSwitcher рендерится
 * в BaseLayout под условием import.meta.env.DEV, в собранный сайт не попадает.
 */
const root = document.documentElement;
const KEY = 'dev-palette';

try {
  const saved = localStorage.getItem(KEY);
  if (saved) root.dataset.palette = saved;
} catch {}

document.querySelectorAll<HTMLButtonElement>('[data-palette-btn]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.paletteBtn!;
    root.dataset.palette = id;
    try {
      localStorage.setItem(KEY, id);
    } catch {}
  });
});

export {}; // отдельный модуль: свои переменные не пересекаются с другими скриптами
