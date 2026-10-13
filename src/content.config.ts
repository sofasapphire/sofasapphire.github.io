/**
 * Коллекции контента, который редактируется в админке.
 * Схема каждой коллекции — в своём файле src/content/schemas/<коллекция>.ts.
 */
import { shoots } from './content/schemas/shoots';
import { slides } from './content/schemas/slides';

export const collections = { shoots, slides };
