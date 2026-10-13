/**
 * Главная страница: тексты и фото блоков (по JSON-файлу на блок, админка → «Главная страница»).
 * Слайды первого экрана — коллекция src/content/slides (админка → «Слайдер на главной»).
 */
import type { ImageMetadata } from 'astro';

import about from './about.json';
import certificate from './certificate.json';
import intro from './intro.json';

import { imageFinder } from '@/lib/images';

export { about, certificate, intro };

const image = imageFinder(
  import.meta.glob<{ default: ImageMetadata }>('/src/assets/home/*.{jpg,jpeg,png,webp}', {
    eager: true,
  }),
  'src/assets/home',
);

export const aboutPhoto = { image: image(about.photo), alt: about.photoAlt };
