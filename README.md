# Sofa Sapphire — сайт фотографа

Сайт-портфолио фотографа Софы (Брест): виды съёмки, съёмки с галереями, подарочный сертификат, контакты.

**Стек:** [Astro 5](https://docs.astro.build) (статический сайт) · TypeScript (strict) · Content Collections · `astro:assets` (оптимизация фото в webp) · чистый CSS с дизайн-токенами · Prettier.
Без UI-фреймворков и CSS-библиотек: на выходе обычный HTML + немного JS (слайдер, мобильное меню).

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:4321
```

| Команда                 | Что делает                                        |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | локальный сервер с автообновлением                |
| `npm run build`         | сборка в `dist/` (+ генерация webp всех размеров) |
| `npm run preview`       | просмотр собранного `dist/`                       |
| `npm run check`         | проверка типов TypeScript / Astro                 |
| `npm run format`        | форматирование кода (Prettier)                    |
| `npm run photos:import` | импорт съёмки из папки с оригиналами (см. ниже)   |

Требуется Node.js 20+.

## Структура

```
src/
├── pages/                     маршруты (файл = страница)
│   ├── index.astro            главная (порядок блоков)
│   ├── obo-mne.astro          /obo-mne/ — «Обо мне» (порядок блоков)
│   ├── ceny.astro             /ceny/ — «Цены» (порядок блоков)
│   ├── portfolio.astro        /portfolio/ — все съёмки с фильтром по виду (?vid=<вид>)
│   └── [category]/
│       ├── index.astro        /<вид-съёмки>/          — список съёмок
│       └── [shoot].astro      /<вид-съёмки>/<съёмка>/ — галерея съёмки
├── layouts/BaseLayout.astro   <head> (SEO, шрифты), шапка, футер
├── components/                только разметка + scoped-стили
│   ├── layout/                Header, Footer, PaletteSwitcher (только в dev)
│   ├── home/                  блоки главной: HeroSlider, Intro, Portfolio, AboutTeaser, …
│   ├── about/                 блоки «Обо мне»: AboutIntro, AboutFacts, AboutStory, AboutApproach, AboutQuote
│   ├── prices/                блоки «Цены»: PricePackages, PriceIncluded, PriceExtras, PriceFaq
│   ├── portfolio/             CategoryCard, ShootCard, ShootGrid, Gallery
│   └── ui/                    Button, SectionHeading, PageHeader, ContactCta, Lines, …
├── content/                   записи из админки: <slug>/index.md + фото рядом
│   ├── shoots/                съёмки
│   ├── slides/                слайды первого экрана главной
│   └── schemas/               схемы полей: shoots.ts, slides.ts, image.ts
├── content.config.ts          подключает схемы коллекций
├── data/                      тексты и данные — по файлу на блок
│   ├── site.ts                имя, контакты, меню
│   ├── categories.json/.ts    виды съёмки (админка)
│   ├── reviews.json/.ts       отзывы (админка)
│   ├── pages/home/            главная: intro.json, about.json, certificate.json (админка)
│   │   └── index.ts           реэкспорт текстов + поиск фото блоков по имени файла
│   ├── pages/about/           «Обо мне»: intro, facts, story, approach, quote (.json) + index.ts
│   ├── pages/prices/          «Цены»: intro, packages, included, extras, faq (.json) + index.ts
│   └── blocks/                общие блоки: contact-cta.json (админка)
├── scripts/                   поведение в браузере — по файлу на функцию:
│                              header-menu, hero-slider, reviews-rotator, gallery-lightbox,
│                              portfolio-filter, reveal, palette-switcher
├── lib/                       логика сборки: shoots.ts, slides.ts (выборка), masonry.ts (раскладка), images.ts (фото по имени)
├── assets/home/, assets/about/  фото блоков страниц (сюда их кладёт админка)
└── styles/
    ├── tokens.css             цвета, шрифты, размеры — менять оформление здесь
    ├── motion.css             анимации
    └── base.css               сброс, типографика, утилиты, фоны секций
public/                        файлы «как есть»: favicon, robots.txt
public/admin/                  админка (Sveltia CMS)
├── index.html                 подключает файлы настроек (порядок = порядок разделов)
├── config.yml                 подключение: GitHub, фото
└── collections/               разделы: shoots, slides, pages-home, pages-about, pages-prices, blocks, settings
scripts/import-photos.mjs      массовый импорт съёмки из папки
```

**Правила:**

- Маленькие файлы по смыслу: тексты блока — свой JSON, вёрстка — свой компонент,
  логика — свой скрипт, раздел админки — свой YAML. Подробно — в `CLAUDE.md`.
- Цвета и шрифты — только через переменные из `tokens.css` (`var(--color-accent)` и т.д.).
- Стили блока — внутри его `.astro`-файла (`<style>` изолирован от остальных).
- Импорты — через алиас `@/` (`@/components/ui/Button.astro`).
- Адреса — только латиница в нижнем регистре и дефисы.

## Админка

Съёмки, виды съёмки и отзывы редактируются в админке — **Sveltia CMS** (бесплатная, open source, без своего сервера).
Она сохраняет изменения прямо в git-репозиторий, после чего хостинг сам пересобирает сайт.

- **На опубликованном сайте:** `https://<домен>/admin/` → «Войти через GitHub».
- **Локально:** `npm run dev` → http://localhost:4321/admin (Chrome/Edge) →
  «Работать с локальным репозиторием» → выбрать папку `site`. Изменения пишутся в файлы проекта.

Настройка разделов — `public/admin/collections/*.yml`. Загруженные фото сразу сжимаются в webp до 2400 px.

**Съёмка** = папка `src/content/shoots/<адрес>/` с `index.md` и фото:

```md
---
title: Аня и Макс
category: svadby # вид съёмки, см. src/data/categories.json
date: 2025-06-14
cover: ./00012.jpg
coverAlt: Аня и Макс на первом танце
subtitle: Летняя свадьба в усадьбе под Брестом
photos: # порядок = порядок в галерее
  - ./00012.jpg
  - ./00015.jpg
draft: false # true — скрыть с сайта
---

Пара строк истории.
```

Страница: `/<category>/<адрес>/`. Обложка вида съёмки на главной — из самой свежей съёмки.

Для массового переноса архива есть скрипт:
`npm run photos:import -- "<папка с оригиналами>" <вид> <адрес> "Название"`.

## Деплой (бесплатно, со своим доменом)

Сайт статический — `npm run build` даёт папку `dist/`, которую можно разместить на любом хостинге.

**Рекомендуется: Cloudflare Pages** (бесплатно: приватный репозиторий, безлимитный трафик, HTTPS, свой домен).

1. Залить проект в репозиторий GitHub (можно приватный).
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → выбрать репозиторий.
3. Build command: `npm run build`, output directory: `dist`, переменная `NODE_VERSION=20`.
4. После первого деплоя: Custom domains → добавить свой домен. HTTPS выдаётся автоматически.
5. Поменять `SITE_URL` в `astro.config.mjs` на свой домен.
6. Админка: в `public/admin/config.yml` указать `repo`, развернуть [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) (Cloudflare Worker, бесплатно) и вписать его адрес в `base_url`.

Каждый `git push` в основную ветку — автоматический деплой; для других веток — превью-ссылка.

**Альтернатива: GitHub Pages** — тоже бесплатно и со своим доменом, но на бесплатном тарифе репозиторий должен быть публичным.

Платить нужно только за сам домен (≈10–15 $ в год за `.com`).
