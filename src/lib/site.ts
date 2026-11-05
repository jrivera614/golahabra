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

export async function getSchoolsWithGames() {
  const schools = (await getCollection('schools')).sort((a, b) => a.data.order - b.data.order);
  const games = (await getCollection('games', ({ data }) => isLive(data))).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  return schools.map((s) => {
    const mine = games.filter((g) => g.data.school === s.id);
    const finals = mine.filter((g) => g.data.status === 'final');
    const wins = finals.filter((g) => (g.data.us ?? 0) > (g.data.them ?? 0)).length;
    const losses = finals.filter((g) => (g.data.us ?? 0) < (g.data.them ?? 0)).length;
    return {
      id: s.id,
      ...s.data,
      games: mine,
      latestFinal: finals[0],
      next: mine.filter((g) => g.data.status === 'upcoming').at(-1),
      record: finals.length ? `${wins}-${losses}` : '',
    };
  });
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
