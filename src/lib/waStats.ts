import fs from "node:fs/promises";
import path from "node:path";

type WaClickEvent = {
  at: string;
  ip: string;
  referer: string;
  userAgent: string;
  text: string;
};

export type WaStats = {
  totalClicks: number;
  lastClickAt: string | null;
  byDay: Record<string, number>;
  recentEvents: WaClickEvent[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STATS_FILE = path.join(DATA_DIR, "wa-stats.json");
const MAX_RECENT_EVENTS = 120;

function emptyStats(): WaStats {
  return {
    totalClicks: 0,
    lastClickAt: null,
    byDay: {},
    recentEvents: [],
  };
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STATS_FILE);
  } catch {
    await fs.writeFile(STATS_FILE, JSON.stringify(emptyStats(), null, 2), "utf8");
  }
}

async function readStats(): Promise<WaStats> {
  await ensureFile();
  try {
    const raw = await fs.readFile(STATS_FILE, "utf8");
    const parsed = JSON.parse(raw) as WaStats;
    return {
      totalClicks: Number(parsed.totalClicks || 0),
      lastClickAt: parsed.lastClickAt || null,
      byDay: parsed.byDay || {},
      recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : [],
    };
  } catch {
    return emptyStats();
  }
}

async function writeStats(stats: WaStats) {
  await ensureFile();
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), "utf8");
}

export async function registerWaClick(event: WaClickEvent) {
  const stats = await readStats();
  const day = event.at.slice(0, 10);

  stats.totalClicks += 1;
  stats.lastClickAt = event.at;
  stats.byDay[day] = (stats.byDay[day] || 0) + 1;
  stats.recentEvents.unshift(event);
  stats.recentEvents = stats.recentEvents.slice(0, MAX_RECENT_EVENTS);

  await writeStats(stats);
}

export async function getWaStats() {
  return readStats();
}
