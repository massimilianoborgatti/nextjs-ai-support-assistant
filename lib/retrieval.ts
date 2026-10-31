import faq from '../content/faq.json';
import type { Faq } from './types';
const stop = new Set(
  'a an the is are do does how what when where can could should would i my you your it to of for in on and with about please me someone else as by be have has that this'.split(
    ' ',
  ),
);
const forms: Record<string, string> = {};
for (const [root, variants] of Object.entries({
  ship: ['ship', 'ships', 'shipping', 'shipped'],
  deliver: ['deliver', 'delivers', 'delivery', 'deliveries', 'delivered'],
  open: ['open', 'opens', 'opening'],
  pay: ['pay', 'pays', 'paying', 'paid', 'payment', 'payments'],
  cancel: ['cancel', 'cancels', 'cancelling', 'canceling', 'cancelled', 'canceled', 'cancellation'],
  collect: ['collect', 'collects', 'collecting', 'collected', 'collection'],
  return: ['return', 'returns', 'returning', 'returned'],
  change: ['change', 'changes', 'changing', 'changed'],
  water: ['water', 'waters', 'watering', 'watered'],
  wrap: ['wrap', 'wraps', 'wrapping', 'wrapped'],
  damage: ['damage', 'damages', 'damaged', 'broken'],
  repot: ['repot', 'repotting', 'repotted'],
  time: ['time', 'times', 'duration', 'long'],
  cost: ['cost', 'costs', 'price', 'prices', 'fee', 'fees'],
  pet: ['pet', 'pets', 'animal', 'animals', 'cat', 'cats', 'dog', 'dogs'],
}))
  for (const variant of variants) forms[variant] = root;
export function tokens(text: string) {
  const words =
    text
      .toLowerCase()
      .replace(/\bpick[ -]+up\b/g, 'pickup')
      .match(/[a-z0-9]+/g) ?? [];
  return [
    ...new Set(
      words
        .filter((word) => !stop.has(word))
        .map(
          (word) =>
            forms[word] ?? (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word),
        ),
    ),
  ];
}
export type RetrievalResult =
  { kind: 'match'; entries: Faq[] } | { kind: 'ambiguous'; choices: Faq[] } | { kind: 'none' };
export function searchFaq(question: string, entries: Faq[] = faq): RetrievalResult {
  const query = tokens(question);
  const indexed = entries.map((entry) => ({
    entry,
    title: tokens(entry.title),
    tags: tokens(entry.tags.join(' ')),
    body: tokens(entry.body),
  }));
  const scored = indexed
    .map(({ entry, title, tags, body }) => {
      if (
        entry.requires?.length &&
        !tokens(entry.requires.join(' ')).some((term) => query.includes(term))
      )
        return { entry, score: 0, strong: 0, matched: [] as string[] };
      let strong = 0;
      const matched: string[] = [];
      const score = query.reduce((total, word) => {
        const frequency = indexed.filter(
          (item) => item.title.includes(word) || item.tags.includes(word),
        ).length;
        const specificity = 1 + Math.log((entries.length + 1) / (frequency + 1));
        const match = title.includes(word) || tags.includes(word);
        if (match) {
          strong++;
          matched.push(word);
        }
        return (
          total +
          (match ? (title.includes(word) ? 5 : 4) * specificity : body.includes(word) ? 0.25 : 0)
        );
      }, 0);
      return { entry, score, strong, matched };
    })
    .filter((item) => item.strong > 0 && item.score >= 4)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  const best = scored[0],
    second = scored[1];
  if (!best) return { kind: 'none' };
  if (
    second &&
    ((best.strong === 1 && best.matched.join() === second.matched.join()) ||
      best.score - second.score < Math.max(2, best.score * 0.15))
  )
    return { kind: 'ambiguous', choices: [best.entry, second.entry] };
  return {
    kind: 'match',
    entries: scored
      .filter((item) => item.score >= best.score * 0.6)
      .slice(0, 3)
      .map((item) => item.entry),
  };
}
export function retrieve(question: string, entries: Faq[] = faq): Faq[] {
  const result = searchFaq(question, entries);
  return result.kind === 'match' ? result.entries : [];
}
