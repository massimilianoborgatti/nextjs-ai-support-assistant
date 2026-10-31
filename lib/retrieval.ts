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
  leaf: ['leaf', 'leaves'],
  order: ['order', 'orders', 'ordered', 'ordering'],
  arrive: ['arrive', 'arrives', 'arrived', 'arriving'],
  country: ['country', 'countries'],
  send: ['send', 'sending', 'sent'],
  cost: ['cost', 'costs', 'price', 'prices', 'fee', 'fees'],
  pet: ['pet', 'pets', 'animal', 'animals', 'cat', 'cats', 'dog', 'dogs'],
}))
  for (const variant of variants) forms[variant] = root;

// General vocabulary is context, not evidence for a particular FAQ answer.
const generic = new Set(
  'plant order send get add help need want take tell something purchase gift care leaf leaves'.split(
    ' ',
  ),
);
function words(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/\b(where|what|when|who|how)['’]s\b/g, '$1 is')
      .replace(/\bpick(?:[ -]+it)?[ -]+up\b/g, 'pickup')
      .match(/[a-z0-9]+/g) ?? []
  ).map(
    (word) => forms[word] ?? (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word),
  );
}
export function tokens(text: string) {
  return [...new Set(words(text).filter((word) => !stop.has(word)))];
}
function containsPhrase(question: string[], phrase: string[]) {
  return (
    phrase.length > 0 &&
    question.some((_, index) => phrase.every((word, offset) => question[index + offset] === word))
  );
}
export type RetrievalResult =
  { kind: 'match'; entries: Faq[] } | { kind: 'ambiguous'; choices: Faq[] } | { kind: 'none' };
export function searchFaq(question: string, entries: Faq[] = faq): RetrievalResult {
  const sequence = words(question),
    query = tokens(question);
  const indexed = entries.map((entry) => {
    const features = new Map<string, { phrase: string[]; weight: number }>();
    for (const term of tokens(entry.title))
      if (!generic.has(term)) features.set(term, { phrase: [term], weight: 5 });
    for (const tag of entry.tags) {
      const phrase = words(tag),
        key = phrase.join(' ');
      if (!phrase.length || (phrase.length === 1 && (generic.has(key) || stop.has(key)))) continue;
      if (!features.has(key)) features.set(key, { phrase, weight: phrase.length > 1 ? 6 : 4 });
    }
    return { entry, features, body: tokens(entry.body) };
  });
  const scored = indexed
    .map(({ entry, features, body }) => {
      if (
        entry.requires?.length &&
        !entry.requires.some((term) => containsPhrase(sequence, words(term)))
      )
        return { entry, score: 0, matched: [] as string[] };
      const matched = [...features.keys()].filter((key) =>
        containsPhrase(sequence, features.get(key)!.phrase),
      );
      const score =
        matched.reduce((total, key) => {
          const frequency = indexed.filter((item) => item.features.has(key)).length;
          return (
            total +
            features.get(key)!.weight * (1 + Math.log((entries.length + 1) / (frequency + 1)))
          );
        }, 0) +
        query.filter((word) => !generic.has(word) && body.includes(word)).length * 0.25;
      return { entry, score, matched };
    })
    .filter((item) => item.matched.length > 0 && item.score >= 4)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  const best = scored[0],
    second = scored[1];
  if (!best) return { kind: 'none' };
  if (
    second &&
    ((best.matched.length === 1 && best.matched.join() === second.matched.join()) ||
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
