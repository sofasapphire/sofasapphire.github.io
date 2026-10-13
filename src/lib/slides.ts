/** Слайды первого экрана: опубликованные, по полю «порядок». */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Slide = CollectionEntry<'slides'>;

export async function getHeroSlides(): Promise<Slide[]> {
  const slides = await getCollection('slides', (s) => !s.data.draft);
  return slides.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}
