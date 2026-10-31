import faq from '../content/faq.json';
import type { Faq } from './types';
const stop = new Set(
  'a an the is are do does how what when where can i my you your it to of for in on and with about please me much'.split(
    ' ',
  ),
);
export function tokens(text: string) {
  return [
    ...new Set(
      (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
        .filter((word) => !stop.has(word))
        .map((word) => (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word)),
    ),
  ];
}
export function retrieve(question: string, entries: Faq[] = faq): Faq[] {
  const query = tokens(question);
  return entries
    .map((entry) => {
      const title = tokens(entry.title),
        tags = tokens(entry.tags.join(' ')),
        body = tokens(entry.body);
      const score = query.reduce(
        (sum, word) =>
          sum +
          (title.includes(word) ? 4 : 0) +
          (tags.includes(word) ? 3 : 0) +
          (body.includes(word) ? 1 : 0),
        0,
      );
      return { entry, score };
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
    .slice(0, 3)
    .map((item) => item.entry);
}
