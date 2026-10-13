/**
 * Съёмки. Одна съёмка = одна папка src/content/shoots/<адрес>/:
 *   index.md   — поля ниже + пара строк истории
 *   *.jpg/webp — фото (порядок в галерее — как в поле photos)
 * Адрес страницы: /<category>/<адрес>/. Раздел админки — public/admin/collections/shoots.yml.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import { localImage } from './image';

export const shoots = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/shoots',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: (ctx) =>
    z.object({
      title: z.string(),
      /** slug вида съёмки из src/data/categories.json */
      category: z.string(),
      /** Дата съёмки — для сортировки (новые выше). */
      date: z.coerce.date(),
      cover: localImage(ctx),
      coverAlt: z.string().default(''),
      /** Подпись под названием в списке съёмок. */
      subtitle: z.string().optional(),
      photos: z.array(localImage(ctx)).default([]),
      /** Скрыть съёмку с сайта, не удаляя её. */
      draft: z.boolean().default(false),
    }),
});
