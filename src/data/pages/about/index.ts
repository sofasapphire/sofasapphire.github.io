/**
 * Страница «Обо мне»: тексты и фото блоков (по JSON-файлу на блок, админка → «Страница „Обо мне“»).
 * Фото — src/assets/about/.
 */
import type { ImageMetadata } from 'astro';

import approach from './approach.json';
import facts from './facts.json';
import intro from './intro.json';
import quote from './quote.json';
import story from './story.json';

import { imageFinder } from '@/lib/images';

export { approach, facts, intro, quote, story };

const image = imageFinder(
  import.meta.glob<{ default: ImageMetadata }>('/src/assets/about/*.{jpg,jpeg,png,webp}', {
    eager: true,
  }),
  'src/assets/about',
);

export const photos = {
  intro: { image: image(intro.photo), alt: intro.photoAlt },
  story: { image: image(story.photo), alt: story.photoAlt },
  quote: { image: image(quote.photo), alt: '' },
};
