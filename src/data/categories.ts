/**
 * Виды съёмки. Редактируются в админке: «Виды съёмки».
 * Порядок в списке = порядок на сайте; первый вид — крупная плитка на главной.
 * `slug` — адрес страницы (/<slug>/). После создания вида его лучше не менять:
 * съёмки ссылаются на вид по slug.
 */
import data from './categories.json';

export interface Category {
  slug: string;
  title: string;
  short: string;
}

/** Адреса, занятые служебными страницами. */
const RESERVED_SLUGS = new Set(['admin', 'portfolio', 'ceny', 'sertifikat', 'obo-mne', 'kontakty']);

export const categories: Category[] = data.items.filter((c) => {
  if (RESERVED_SLUGS.has(c.slug)) {
    console.warn(
      `[categories] Адрес «${c.slug}» занят служебной страницей — вид «${c.title}» пропущен.`,
    );
    return false;
  }
  return true;
});

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
