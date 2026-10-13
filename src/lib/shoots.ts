/** Работа со съёмками: выборка по виду съёмки, адреса страниц. */
import { getCollection, type CollectionEntry } from 'astro:content';

import { getCategory } from '@/data/categories';

export type Shoot = CollectionEntry<'shoots'>;

export function shootUrl(shoot: Shoot): string {
  return `/${shoot.data.category}/${shoot.id}/`;
}

/**
 * Опубликованные съёмки, новые сверху. Если указан вид — только его.
 * Съёмки удалённого вида не ломают сборку: они пропускаются с предупреждением.
 */
export async function getShoots(category?: string): Promise<Shoot[]> {
  const all = await getCollection('shoots', (s) => !s.data.draft);
  return all
    .filter((s) => {
      if (getCategory(s.data.category)) return true;
      console.warn(
        `[shoots] «${s.data.title}»: вида съёмки «${s.data.category}» больше нет — съёмка скрыта.`,
      );
      return false;
    })
    .filter((s) => !category || s.data.category === category)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
