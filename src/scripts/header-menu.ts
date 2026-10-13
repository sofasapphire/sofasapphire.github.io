/** Мобильное меню: бургер открывает/закрывает навигацию. */
const header = document.querySelector<HTMLElement>('[data-header]');
const burger = header?.querySelector<HTMLButtonElement>('.burger');

burger?.addEventListener('click', () => {
  const open = header!.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
header
  ?.querySelectorAll('.nav a')
  .forEach((link) => link.addEventListener('click', () => header.classList.remove('is-open')));

export {}; // отдельный модуль: свои переменные не пересекаются с другими скриптами
