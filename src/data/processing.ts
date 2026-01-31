import type { DailyArea, MonthlyChange, RatePoint } from '../types';

/**
 * Convert a step-function time series to linearly interpolated values.
 *
 * ISW publishes control map updates in infrequent batches, creating a step-function
 * pattern. This distributes each batch update evenly across the days since the
 * previous update.
 */
export function interpolateStepFunction(
  dates: string[],
  values: number[],
  threshold = 0.5,
): number[] {
  const n = values.length;
  if (n < 2) return [...values];

  // Find change point indices
  const changeIndices: number[] = [0];
  for (let i = 1; i < n; i++) {
    if (Math.abs(values[i] - values[i - 1]) > threshold) {
      changeIndices.push(i);
    }
  }
  if (changeIndices[changeIndices.length - 1] !== n - 1) {
    changeIndices.push(n - 1);
  }

  const changeValues = changeIndices.map((i) => values[i]);

  // Linear interpolation between change points
  const result: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    // Find the two surrounding change points
    let lo = 0;
    let hi = changeIndices.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (changeIndices[mid] <= i) lo = mid;
      else hi = mid;
    }

    const x0 = changeIndices[lo];
    const x1 = changeIndices[hi];
    const y0 = changeValues[lo];
    const y1 = changeValues[hi];

    if (x0 === x1) {
      result[i] = y0;
    } else {
      result[i] = y0 + ((y1 - y0) * (i - x0)) / (x1 - x0);
    }
  }

  return result;
}

/**
 * Apply rolling median to smooth outliers.
 */
export function rollingMedian(values: number[], window = 7): number[] {
  const result: number[] = [];
  const half = Math.floor(window / 2);

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - half);
    const end = Math.min(values.length, i + half + 1);
    const slice = values.slice(start, end).sort((a, b) => a - b);
    result.push(slice[Math.floor(slice.length / 2)]);
  }

  return result;
}

/**
 * Compute monthly changes: end-of-month minus start-of-month area.
 */
export function computeMonthlyChanges(
  dates: string[],
  values: number[],
): MonthlyChange[] {
  const byMonth = new Map<string, { first: number; last: number }>();

  for (let i = 0; i < dates.length; i++) {
    const month = dates[i].substring(0, 7); // YYYY-MM
    const existing = byMonth.get(month);
    if (!existing) {
      byMonth.set(month, { first: values[i], last: values[i] });
    } else {
      existing.last = values[i];
    }
  }

  const months = Array.from(byMonth.keys()).sort();
  const changes: MonthlyChange[] = [];

  for (let i = 1; i < months.length; i++) {
    const prev = byMonth.get(months[i - 1])!;
    const curr = byMonth.get(months[i])!;
    changes.push({
      month: months[i],
      change: curr.last - prev.last,
    });
  }

  return changes;
}

/**
 * Compute rolling 30-day rate of change in km²/month.
 */
export function computeRateOfChange(
  dates: string[],
  values: number[],
  windowDays = 30,
): RatePoint[] {
  const half = Math.floor(windowDays / 2);
  const result: RatePoint[] = [];

  for (let i = half; i < values.length - half; i++) {
    const diffs: number[] = [];
    const start = Math.max(0, i - half);
    const end = Math.min(values.length - 1, i + half);

    for (let j = start + 1; j <= end; j++) {
      diffs.push(values[j] - values[j - 1]);
    }

    const avgDaily = diffs.reduce((s, d) => s + d, 0) / diffs.length;
    result.push({
      date: dates[i],
      area: values[i],
      rate: avgDaily * 30, // km²/month
    });
  }

  return result;
}

/**
 * Filter daily area data by date range.
 */
export function filterByDateRange(
  data: DailyArea[],
  start: Date,
  end: Date,
): DailyArea[] {
  const startStr = start.toISOString().substring(0, 10);
  const endStr = end.toISOString().substring(0, 10);
  return data.filter((d) => d.date >= startStr && d.date <= endStr);
}

/**
 * Extract and process data for a specific layer type.
 */
export function getLayerData(
  data: DailyArea[],
  layerType: string,
): { dates: string[]; raw: number[]; interpolated: number[]; smoothed: number[] } {
  const filtered = data
    .filter((d) => d.layerType === layerType)
    .sort((a, b) => a.date.localeCompare(b.date));

  const dates = filtered.map((d) => d.date);
  const raw = filtered.map((d) => d.areaKm2);
  const interpolated = interpolateStepFunction(dates, raw);
  const smoothed = rollingMedian(interpolated);

  return { dates, raw, interpolated, smoothed };
}

/**
 * Compute linear trend line (slope and intercept).
 */
export function linearTrend(values: number[]): { slope: number; intercept: number; trendValues: number[] } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0, trendValues: [...values] };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trendValues = Array.from({ length: n }, (_, i) => intercept + slope * i);

  return { slope, intercept, trendValues };
}
