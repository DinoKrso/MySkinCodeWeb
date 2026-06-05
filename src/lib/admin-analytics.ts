import { endpoints } from "./config";

const HISTORY_KEY = "myskincode_admin_users_count_history";
const MAX_HISTORY = 48;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Broj dana na grafu trenda korisnika. */
export const CHART_HISTORY_DAYS = 7;

export type CountSnapshot = {
  count: number;
  table?: string;
  filter?: string;
  fetchedAt: string;
};

export type UsersCountSnapshot = CountSnapshot;
export type ProductsCountSnapshot = CountSnapshot;

export type UsersCountHistoryPoint = {
  t: number;
  count: number;
};

function startOfLocalDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function loadUsersCountHistory(): UsersCountHistoryPoint[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UsersCountHistoryPoint[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - CHART_HISTORY_DAYS * MS_PER_DAY;
    return parsed
      .filter(
        (p) =>
          typeof p.t === "number" &&
          typeof p.count === "number" &&
          Number.isFinite(p.count) &&
          p.t >= cutoff,
      )
      .slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

export function appendUsersCountHistory(
  count: number,
): UsersCountHistoryPoint[] {
  const prev = loadUsersCountHistory();
  const last = prev[prev.length - 1];
  const now = Date.now();

  const next =
    last && last.count === count && now - last.t < 60_000
      ? prev
      : [...prev, { t: now, count }].slice(-MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

async function fetchCountSnapshot(
  url: string,
  resourceLabel: string,
): Promise<CountSnapshot> {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const raw: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      raw &&
      typeof raw === "object" &&
      "error" in raw &&
      typeof (raw as { error: unknown }).error === "string"
        ? (raw as { error: string }).error
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  const count =
    raw &&
    typeof raw === "object" &&
    "count" in raw &&
    typeof (raw as { count: unknown }).count === "number"
      ? Math.max(0, Math.floor((raw as { count: number }).count))
      : null;

  if (count === null) {
    throw new Error(`API nije vratio broj ${resourceLabel}.`);
  }

  const table =
    raw &&
    typeof raw === "object" &&
    "table" in raw &&
    typeof (raw as { table: unknown }).table === "string"
      ? (raw as { table: string }).table
      : undefined;

  const filter =
    raw &&
    typeof raw === "object" &&
    "filter" in raw &&
    typeof (raw as { filter: unknown }).filter === "string"
      ? (raw as { filter: string }).filter
      : undefined;

  return {
    count,
    table,
    filter,
    fetchedAt: new Date().toISOString(),
  };
}

export function fetchRegisteredUsersCount(): Promise<UsersCountSnapshot> {
  return fetchCountSnapshot(endpoints.adminUsersCount, "korisnika");
}

export function fetchProductsCount(): Promise<ProductsCountSnapshot> {
  return fetchCountSnapshot(endpoints.adminProductsCount, "proizvoda");
}

export function formatHistoryLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

/** Jedna točka po danu za zadnjih N dana (uključujući danas). */
export function getUsersCountChartSeries(
  points: UsersCountHistoryPoint[],
  currentCount: number,
  days: number = CHART_HISTORY_DAYS,
): UsersCountHistoryPoint[] {
  const todayStart = startOfLocalDay(Date.now());
  const sorted = [...points].sort((a, b) => a.t - b.t);

  let lastKnown =
    sorted.length > 0 ? sorted[sorted.length - 1].count : currentCount;

  const series: UsersCountHistoryPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = todayStart - i * MS_PER_DAY;
    const dayEnd = dayStart + MS_PER_DAY;

    const inDay = sorted.filter((p) => p.t >= dayStart && p.t < dayEnd);
    if (inDay.length > 0) {
      lastKnown = inDay[inDay.length - 1].count;
    } else {
      const before = sorted.filter((p) => p.t < dayEnd);
      if (before.length > 0) {
        lastKnown = before[before.length - 1].count;
      }
    }

    series.push({
      t: dayStart,
      count: i === 0 ? currentCount : lastKnown,
    });
  }

  return series;
}

export function formatChartDayLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("hr-HR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(timestamp));
}
