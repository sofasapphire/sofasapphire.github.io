#!/usr/bin/env node
/**
 * Импорт съёмки в сайт.
 *
 *   npm run photos:import -- "<папка с оригиналами>" <вид-съёмки> <название-съёмки> ["Заголовок"]
 *
 * Пример:
 *   npm run photos:import -- "C:/Users/sofia/Desktop/портфолио/индивидуалка/Алиса" portrety alisa "Алиса"
 *
 * Что делает:
 *   - уменьшает каждое фото до 2400 px по длинной стороне (оригиналы не трогает);
 *   - кладёт их в src/content/shoots/<название>/;
 *   - создаёт index.md (если его ещё нет): вид съёмки, обложка (первое фото), список всех фото.
 *
 * Обычно съёмки добавляются через админку (/admin/); скрипт — для массового переноса архива.
 * Дальше Astro при сборке сам делает webp нужных размеров.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const MAX_SIZE = 2400;
const QUALITY = 85;
const PHOTO_RE = /\.(jpe?g|png|webp)$/i;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [source, category, slug, title = slug] = process.argv.slice(2);

if (!source || !category || !slug) {
  console.error(
    'Использование: npm run photos:import -- "<папка>" <вид-съёмки> <название> ["Заголовок"]',
  );
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(
    `Название "${slug}": только латиница в нижнем регистре, цифры и дефис (например anya-i-max).`,
  );
  process.exit(1);
}

const { items: categories } = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/categories.json'), 'utf8'),
);
if (!categories.some((c) => c.slug === category)) {
  console.error(
    `Неизвестный вид съёмки "${category}". Есть: ${categories.map((c) => c.slug).join(', ')}.`,
  );
  process.exit(1);
}

const files = fs
  .readdirSync(source)
  .filter((f) => PHOTO_RE.test(f))
  .sort();
if (files.length === 0) {
  console.error(`В папке "${source}" нет фото.`);
  process.exit(1);
}

const dest = path.join(root, 'src/content/shoots', slug);
// Не трогаем существующую съёмку: её могли создать или поправить в админке.
if (fs.existsSync(dest)) {
  console.error(`Съёмка "${slug}" уже есть (${path.relative(root, dest)}). Выберите другой адрес.`);
  process.exit(1);
}
fs.mkdirSync(dest, { recursive: true });

const outNames = files.map((f) => path.parse(f).name.toLowerCase() + '.jpg');

for (const [i, file] of files.entries()) {
  const out = path.join(dest, outNames[i]);
  await sharp(path.join(source, file))
    .rotate()
    .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(out);
  console.log('  ✓', path.relative(root, out));
}

const indexFile = path.join(dest, 'index.md');
if (!fs.existsSync(indexFile)) {
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    indexFile,
    `---
title: ${title}
category: ${category}
date: ${today}
cover: ./${outNames[0]}
coverAlt: ${title}
subtitle: ''
photos:
${outNames.map((n) => `  - ./${n}`).join('\n')}
---

Пара строк о съёмке: где, какое настроение, что важно было сохранить.
`,
  );
  console.log('  ✓', path.relative(root, indexFile), '— допишите текст и проверьте дату');
}

console.log(`Готово: ${files.length} фото → ${path.relative(root, dest)}`);
