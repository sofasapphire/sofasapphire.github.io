/** Общий помощник для фото в записях админки. */
import { z, type SchemaContext } from 'astro:content';

/** Админка пишет путь к фото без "./" ("00007.jpg") — приводим к виду, который понимает Astro. */
export const localImage = ({ image }: SchemaContext) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && !/^(\.{1,2}\/|\/|https?:)/.test(value) ? `./${value}` : value,
    image(),
  );
