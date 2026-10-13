/** Отзывы клиентов. Редактируются в админке: «Настройки сайта → Отзывы». */
import { getCategory } from './categories';
import data from './reviews.json';

export interface Review {
  text: string;
  author: string;
  /** Название вида съёмки (по slug из админки); пусто, если вид не выбран или удалён. */
  shoot?: string;
}

export const reviews: Review[] = data.items
  .filter((r) => r.text?.trim())
  .map((r) => ({
    text: r.text.trim(),
    author: r.author,
    shoot: getCategory(r.category ?? '')?.title,
  }));
