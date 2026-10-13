// @ts-check
import { defineConfig } from 'astro/config';

// Адрес сайта. Поменять на свой домен, когда он будет куплен —
// от него строятся canonical-ссылки, sitemap и og:url.
const SITE_URL = 'https://sofa-sapphire.pages.dev';

/**
 * Админка лежит в public/admin/index.html. Хостинг сам отдаёт её по /admin/,
 * а dev-сервер Astro — нет: /admin/ перехватывает маршрут [category],
 * а /admin без слеша отсекает проверка trailingSlash.
 * Эта интеграция при `npm run dev` подменяет адрес до того, как запрос попадёт в Astro.
 * @type {import('astro').AstroIntegration}
 */
const adminDevRoute = {
  name: 'admin-dev-route',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.httpServer?.prependListener('request', (/** @type {{ url?: string }} */ req) => {
        if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin/index.html';
      });
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [adminDevRoute],
  image: {
    // Оптимизацией фото занимается Astro (sharp): webp + несколько размеров.
    responsiveStyles: true,
  },
});
