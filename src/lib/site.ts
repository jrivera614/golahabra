import { getCollection } from 'astro:content';

export const SITE = {
  name: 'Go La Habra',
  url: 'https://golahabra.com',
  description: 'Where to eat and what is actually happening in La Habra, CA. Local picks, local news, events, and high school sports.',
  email: 'hello@golahabra.com',
  instagram: '',
  tiktok: '',
  newsletterUrl: import.meta.env.PUBLIC_NEWSLETTER_URL || '',
};

export const NAV = [
  { href: '/eat/', label: 'Eat' },
  { href: '/news/', label: 'News' },
  { href: '/events/', label: 'Events' },
  { href: '/sports/', label: 'Sports' },
];

/** Drafts are visible in dev, never in a production build. */
export const isLive = (data: { draft?: boolean }) => import.meta.env.DEV || !data.draft;

export async function getNews() {
  return (await getCollection('news', ({ data }) => isLive(data))).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export async function getRestaurants() {
  return (await getCollection('restaurants', ({ data }) => isLive(data))).sort(
    (a, b) => b.data.added.getTime() - a.data.added.getTime(),
  );
}

export async function getUpcomingEvents(limit?: number) {
  const today = startOfToday();
  const list = (await getCollection('events', ({ data }) => isLive(data) && data.date >= today)).sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime(),
  );
  return limit ? list.slice(0, limit) : list;
}

/**
 * Sports we cover, in priority order. When two are in season at once (say, football
 * playoffs while basketball starts), the first one listed gets the home page card.
 * `id` must match the `sport` enum in src/content.config.ts.
 */
export const SPORTS = [
  { id: 'football', label: 'Football', kicker: 'Friday night' },
  { id: 'boys-basketball', label: 'Boys basketball', kicker: 'On the court' },
  { id: 'girls-basketball', label: 'Girls basketball', kicker: 'On the court' },
  { id: 'boys-soccer', label: 'Boys soccer', kicker: 'On the pitch' },
  { id: 'girls-soccer', label: 'Girls soccer', kicker: 'On the pitch' },
] as const;
export type SportId = (typeof SPORTS)[number]['id'];

/** A sport is in season if it has a game coming up, or a final in the last 10 days. */
const IN_SEASON_LOOKBACK_DAYS = 10;

async function getLiveGames() {
  return (await getCollection('games', ({ data }) => isLive(data))).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export async function getSchoolsWithGames(sport: SportId = 'football') {
  const schools = (await getCollection('schools')).sort((a, b) => a.data.order - b.data.order);
  const games = (await getLiveGames()).filter((g) => g.data.sport === sport);
  const today = startOfToday();
  return schools.map((s) => {
    const mine = games.filter((g) => g.data.school === s.id);
    const finals = mine.filter((g) => g.data.status === 'final');
    const wins = finals.filter((g) => (g.data.us ?? 0) > (g.data.them ?? 0)).length;
    const losses = finals.filter((g) => (g.data.us ?? 0) < (g.data.them ?? 0)).length;
    const ties = finals.length - wins - losses;
    return {
      id: s.id,
      ...s.data,
      games: mine,
      latestFinal: finals[0],
      next: mine.filter((g) => g.data.status === 'upcoming' && g.data.date >= today).at(-1),
      record: finals.length ? `${wins}-${losses}${ties ? `-${ties}` : ''}` : '',
    };
  });
}

/**
 * Every sport that has at least one game, in SPORTS order, flagged with whether it's in season.
 * `featured` is the sport the home card and the Sports page open on.
 */
export async function getSportsOverview() {
  const games = await getLiveGames();
  const today = startOfToday();
  const cutoff = new Date(today.getTime() - IN_SEASON_LOOKBACK_DAYS * 86_400_000);
  const sports = SPORTS.map((sp) => {
    const mine = games.filter((g) => g.data.sport === sp.id);
    const inSeason = mine.some(
      (g) => (g.data.status === 'upcoming' && g.data.date >= today) || (g.data.status === 'final' && g.data.date >= cutoff),
    );
    return { ...sp, hasGames: mine.length > 0, inSeason, latest: mine[0]?.data.date.getTime() ?? 0 };
  }).filter((sp) => sp.hasGames);
  const featured =
    sports.find((sp) => sp.inSeason) ??
    [...sports].sort((a, b) => b.latest - a.latest)[0] ??
    { ...SPORTS[0], hasGames: false, inSeason: false, latest: 0 };
  return { sports, featured };
}

/** Dates in data files are calendar days in La Habra, so format them in UTC to avoid off-by-one shifts. */
export function fmtDate(d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return d.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

export function startOfToday() {
  const now = new Date();
  const la = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return new Date(Date.UTC(la.getFullYear(), la.getMonth(), la.getDate()));
}

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
