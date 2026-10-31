import type { AnswerGenerator } from '../types';
import { isInjection } from '../prompt';
export const notCovered =
  'That question is not covered by the Demo Plant Shop FAQ. Please use the help-center contact form; the demo does not send contact requests.';
export function createMockGenerator(delay = 18): AnswerGenerator {
  return {
    async *generate({ question, entries, signal }) {
      const refused = isInjection(question);
      const entry = refused ? undefined : entries[0];
      const text = refused
        ? 'I can help with Demo Plant Shop questions, but cannot follow requests to override the help-center rules.'
        : entry
          ? `According to our ${entry.title.toLowerCase()}: ${entry.body}`
          : notCovered;
      for (const word of text.match(/\S+\s*/g) ?? []) {
        signal?.throwIfAborted();
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        signal?.throwIfAborted();
        yield { type: 'text', text: word };
      }
      yield { type: 'sources', ids: entry ? [entry.id] : [] };
    },
  };
}
export const mockGenerator = createMockGenerator();
