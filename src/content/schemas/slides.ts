/**
 * Слайды первого экрана главной. Один слайд = одна папка src/content/slides/<адрес>/:
 *   index.md — поля ниже;  фото — в той же папке.
 * Раздел админки — public/admin/collections/slides.yml.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import { localImage } from './image';

export const slides = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/slides',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: (ctx) =>
    z.object({
      image: localImage(ctx),
      /** Что на фото — для поисковиков и незрячих. */
      alt: z.string().default(''),
      /** Какая часть кадра видна при обрезке под экран, CSS object-position (x% y%). */
      position: z.string().default('50% 40%'),
      /** Порядок показа (меньше — раньше). */
      order: z.number().default(100),
      /** Скрыть слайд, не удаляя его. */
      draft: z.boolean().default(false),
    }),
});
