/**
 * Раскладка фото в две колонки — «плетёная витрина» с ровным верхом и низом.
 * Считается при сборке по пропорциям фото, в браузере ничего не вычисляется.
 * Все высоты — в долях ширины колонки (ratio = высота / ширина).
 *
 * Цели, по важности:
 * 1. Никакой ровной сетки: стыки кадров в соседних колонках не совпадают (≥ MIN_SEAM).
 * 2. Верх и низ колонок на одной линии.
 * 3. Как можно меньше кадрирования, порядок фото сохраняется.
 *
 * Как достигается:
 * - Каждый кадр может показываться в родной пропорции или в мягкой альтернативе
 *   (вертикальный 2:3 → 3:4 / 4:5, горизонтальный 3:2 → 4:3). Альтернатива берётся,
 *   только если родной формат дал бы стык вровень с соседней колонкой — или по «ритму»
 *   (примерно каждый третий кадр), чтобы даже одинаковые кадры не шли сдвинутой сеткой.
 * - Фото идёт в колонку, которая сейчас короче; раскладка последних фото перебирается
 *   всеми способами — выбирается вариант с самой маленькой разницей высот и без совпадений стыков.
 * - Остаток разницы делится между последними кадрами обеих колонок в мягких пределах.
 *   Последние пиксели добирает CSS (flex-grow у последнего кадра).
 * - Затем близкие стыки «разводятся»: кадр над стыком чуть удлиняется, следующий — укорачивается,
 *   низ колонки не меняется.
 * - Меньше MIN_PHOTOS_FOR_COLUMNS фото — одна колонка по центру (две без сильной обрезки не выровнять).
 */

export interface MasonryCell {
  /** Номер фото в исходном списке. */
  index: number;
  /** Пропорция, с которой фото показывается (высота / ширина). */
  ratio: number;
  /** Показывается не в родной пропорции (object-fit: cover). */
  cropped: boolean;
}

export type MasonryColumns = [MasonryCell[], MasonryCell[]];

/** Промежуток между фото — в долях ширины колонки (≈14 px при колонке ~620 px). */
const GAP = 0.022;
/** Минимальное расстояние между стыками соседних колонок (≈75 px при колонке ~620 px). */
const MIN_SEAM = 0.12;
/**
 * Ритм: на каких по счёту кадрах колонки предпочитать альтернативный формат (0 — родной).
 * У правой колонки ритм сдвинут (RHYTHM_SHIFT), иначе колонки повторяли бы друг друга
 * и получалась бы та же сетка, только «кирпичиком».
 */
const RHYTHM = [0, 0, 1, 0, 2, 0, 0, 2, 0, 1, 0, 0];
const RHYTHM_SHIFT = 5;
/** Сколько последних фото раскладывать перебором (2^N вариантов). */
const SEARCH_TAIL = 8;
/** Сколько последних кадров колонки участвуют в выравнивании низа. */
const BALANCE_TAIL = 4;

const isVertical = (r: number) => r > 1.05;
const isHorizontal = (r: number) => r < 0.95;

/** Допустимые форматы кадра: родной + мягкие альтернативы. */
function options(natural: number): number[] {
  const alt = isVertical(natural)
    ? [4 / 3, 5 / 4] // 3:4, 4:5
    : isHorizontal(natural)
      ? [3 / 4, 0.7] // 4:3, ~10:7
      : [1.12]; // квадрат → чуть вытянутый
  return [natural, ...alt.filter((r) => Math.abs(r - natural) > 0.03)];
}

/** Пределы плавной подгонки при выравнивании низа. */
function limits(natural: number): [number, number] {
  return isVertical(natural)
    ? [natural * 0.8, natural * 1.1] // обрезка сверху/снизу до 20%, по бокам до 10%
    : [natural * 0.92, natural * 1.15];
}

interface Simulation {
  cols: MasonryColumns;
  heights: [number, number];
  conflicts: number;
}

/** Раскладка при заданных колонках для хвоста (tail[i] — колонка для фото prefix+i). */
function simulate(ratios: number[], prefix: number, tail: number[]): Simulation {
  const cols: MasonryColumns = [[], []];
  const heights: [number, number] = [0, 0];
  const seams: [number[], number[]] = [[], []];
  let conflicts = 0;

  ratios.forEach((natural, index) => {
    const col = index < prefix ? (heights[0] <= heights[1] ? 0 : 1) : tail[index - prefix];
    const other = 1 - col;
    const top = heights[col];

    const opts = options(natural);
    const beat = RHYTHM[(cols[col].length + col * RHYTHM_SHIFT) % RHYTHM.length];
    const preferred = opts[Math.min(beat, opts.length - 1)];
    const ordered = [preferred, ...opts.filter((r) => r !== preferred)];

    // Ближайший стык соседней колонки к нижнему краю кадра
    const distance = (r: number) =>
      Math.min(Infinity, ...seams[other].map((s) => Math.abs(top + r - s)));
    // Последний кадр колонки может закончиться вровень — это и есть ровный низ
    const ok = (r: number) => distance(r) >= MIN_SEAM;

    let ratio = ordered.find(ok);
    if (ratio === undefined) {
      ratio = ordered.reduce((a, b) => (distance(b) > distance(a) ? b : a));
      conflicts++;
    }

    cols[col].push({ index, ratio, cropped: Math.abs(ratio - natural) > 0.005 });
    heights[col] += ratio + GAP;
    seams[col].push(heights[col]);
  });

  return { cols, heights, conflicts };
}

/** Ровный низ: колонки сходятся к общей высоте за счёт последних кадров (на копии). */
function balance(sim: Simulation, ratios: number[]): MasonryColumns {
  const cols = sim.cols.map((col) => col.map((cell) => ({ ...cell }))) as MasonryColumns;
  const { heights } = sim;
  const tails = cols.map((col) => col.slice(-BALANCE_TAIL));
  const room = (cell: MasonryCell, dir: number) => {
    const [lo, hi] = limits(ratios[cell.index]);
    return dir > 0 ? Math.max(0, hi - cell.ratio) : Math.max(0, cell.ratio - lo);
  };

  const longer = heights[0] >= heights[1] ? 0 : 1;
  const shorter = 1 - longer;
  const diff = Math.abs(heights[0] - heights[1]);
  const cap = [0, 0];
  cap[longer] = tails[longer].reduce((s, c) => s + room(c, -1), 0);
  cap[shorter] = tails[shorter].reduce((s, c) => s + room(c, +1), 0);
  const covered = Math.min(diff, cap[0] + cap[1]);
  if (covered === 0) return cols;

  for (const [c, dir] of [
    [longer, -1],
    [shorter, +1],
  ] as const) {
    if (!cap[c]) continue;
    const amount = (covered * cap[c]) / (cap[0] + cap[1]);
    const rooms = tails[c].map((cell) => room(cell, dir));
    tails[c].forEach((cell, i) => {
      cell.ratio += (dir * amount * rooms[i]) / cap[c];
      cell.cropped = Math.abs(cell.ratio - ratios[cell.index]) > 0.005;
    });
  }
  return cols;
}

/**
 * Разводит близкие стыки, не трогая низ колонок: кадр над стыком чуть удлиняется
 * (или укорачивается), а следующий в той же колонке — на столько же наоборот.
 */
function separateSeams(cols: MasonryColumns, ratios: number[]): void {
  const within = (cell: MasonryCell, value: number) => {
    const [lo, hi] = limits(ratios[cell.index]);
    return value >= lo && value <= hi;
  };
  const seamsOf = (col: MasonryCell[]) => {
    let h = 0;
    return col.map((cell) => (h += cell.ratio + GAP));
  };

  for (let pass = 0; pass < 20; pass++) {
    const seams = cols.map(seamsOf);
    let moved = false;

    outer: for (let i = 0; i < seams[0].length - 1; i++) {
      for (let j = 0; j < seams[1].length - 1; j++) {
        const gap = seams[0][i] - seams[1][j];
        if (Math.abs(gap) >= MIN_SEAM) continue;
        // Раздвигаем: левый стык вверх/вниз, иначе правый — в противоположную сторону
        const push = (MIN_SEAM - Math.abs(gap) + 0.01) * (gap >= 0 ? 1 : -1);
        for (const [c, k, delta] of [
          [0, i, push],
          [0, i, push - Math.sign(push) * (2 * MIN_SEAM + 0.02)],
          [1, j, -push],
          [1, j, -push + Math.sign(push) * (2 * MIN_SEAM + 0.02)],
        ] as const) {
          const a = cols[c][k];
          const b = cols[c][k + 1];
          if (within(a, a.ratio + delta) && within(b, b.ratio - delta)) {
            a.ratio += delta;
            b.ratio -= delta;
            a.cropped = Math.abs(a.ratio - ratios[a.index]) > 0.005;
            b.cropped = Math.abs(b.ratio - ratios[b.index]) > 0.005;
            moved = true;
            break outer;
          }
        }
      }
    }
    if (!moved) return;
  }
}

/** Оценка готовой раскладки: остаток разницы низа, близкие стыки, объём кадрирования. */
function score(cols: MasonryColumns, ratios: number[]): number {
  const seams = cols.map((col) => {
    let h = 0;
    return col.map((cell) => (h += cell.ratio + GAP));
  });
  const residual = Math.abs((seams[0].at(-1) ?? 0) - (seams[1].at(-1) ?? 0));
  // Нижние края колонок совпадают намеренно — их не считаем
  let tooClose = 0;
  for (const a of seams[0].slice(0, -1))
    for (const b of seams[1].slice(0, -1)) if (Math.abs(a - b) < MIN_SEAM) tooClose++;
  const crop = cols.flat().reduce((s, c) => s + Math.abs(c.ratio / ratios[c.index] - 1), 0);
  // Ровный низ важнее всего, затем — отсутствие близких стыков, затем — меньше кадрирования
  return residual * 20 + tooClose * 2 + crop * 0.05;
}

/** Меньше этого числа фото — одна колонка по центру (две без сильной обрезки не выровнять). */
export const MIN_PHOTOS_FOR_COLUMNS = 4;

export function layoutMasonry(ratios: number[]): MasonryColumns {
  const n = ratios.length;
  if (n < MIN_PHOTOS_FOR_COLUMNS) {
    return [ratios.map((ratio, index) => ({ index, ratio, cropped: false })), []];
  }

  // Перебор раскладки хвоста; каждый вариант оценивается уже после выравнивания низа
  const tailSize = Math.min(SEARCH_TAIL, n - 1);
  const prefix = n - tailSize;
  let best: MasonryColumns | undefined;
  let bestScore = Infinity;

  for (let mask = 0; mask < 1 << tailSize; mask++) {
    const tail = Array.from({ length: tailSize }, (_, t) => (mask >> t) & 1);
    const sim = simulate(ratios, prefix, tail);
    if (sim.cols[0].length === 0 || sim.cols[1].length === 0) continue;
    const cols = balance(sim, ratios);
    separateSeams(cols, ratios);
    const value = score(cols, ratios) + sim.conflicts * 0.5;
    if (value < bestScore - 1e-9) {
      bestScore = value;
      best = cols;
    }
  }

  return best!;
}
