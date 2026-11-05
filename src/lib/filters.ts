import type { CollectionEntry } from 'astro:content';

const TAG_ORDER = ['Date night', 'Kid friendly', 'Open late', 'Breakfast', 'Big portions', 'Study spot', 'Weekend pick'];

/** Filter chips come from what's actually on the list: cuisines first (by count), then tags. */
export function filterLabels(spots: CollectionEntry<'restaurants'>[]) {
  const counts = new Map<string, number>();
  for (const s of spots) counts.set(s.data.cuisine, (counts.get(s.data.cuisine) ?? 0) + 1);
  const cuisines = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([c]) => c);
  const tagSet = new Set<string>(spots.flatMap((s) => s.data.tags));
  const tags = TAG_ORDER.filter((t) => tagSet.has(t) && !cuisines.includes(t));
  return [...cuisines, ...tags];
}
