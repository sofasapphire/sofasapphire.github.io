/**
 * Поиск фото по пути из админки. Для страниц, чьи тексты лежат в JSON (src/data/pages/*),
 * а фото — в src/assets/<страница>/.
 *
 * Сравнение по имени файла: админка может записать путь по-разному
 * («/src/assets/about/x.webp» или «x.webp»). Нет файла — понятная ошибка при сборке.
 *
 * import.meta.glob должен быть с буквальным путём, поэтому glob делается в модуле страницы,
 * а сюда передаётся его результат:
 *   const find = imageFinder(import.meta.glob('/src/assets/about/*.{jpg,jpeg,png,webp}', { eager: true }), 'src/assets/about');
 */
import type { ImageMetadata } from 'astro';

type ImageModules = Record<string, { default: ImageMetadata }>;

export function imageFinder(modules: ImageModules, folder: string) {
  return (path: string): ImageMetadata => {
    const name = path.split('/').pop();
    const found = Object.entries(modules).find(([file]) => file.split('/').pop() === name);
    if (!found) throw new Error(`Фото «${path}» не найдено в ${folder}/`);
    return found[1].default;
  };
}
