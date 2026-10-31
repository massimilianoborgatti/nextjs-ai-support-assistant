import 'server-only';
import OpenAI from 'openai';
import { buildPrompt } from '../prompt';
import type { AnswerGenerator } from '../types';
export function createServerGenerator(apiKey: string, model: string): AnswerGenerator {
  const client = new OpenAI({ apiKey, maxRetries: 0 });
  return {
    async *generate({ question, entries, signal }) {
      const stream = await client.responses.create(
        {
          model,
          ...buildPrompt(question, entries),
          stream: true,
          store: false,
          max_output_tokens: 500,
        },
        { signal },
      );
      let text = '';
      let pending = '';
      let completed = false;
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') {
          text += event.delta;
          pending += event.delta;
          // Hold citation fragments across stream chunks so raw ids never flash in the UI.
          while (pending) {
            const start = pending.indexOf('[');
            if (start < 0) {
              yield { type: 'text', text: pending };
              pending = '';
              break;
            }
            if (start > 0) {
              yield { type: 'text', text: pending.slice(0, start) };
              pending = pending.slice(start);
            }
            const end = pending.indexOf(']');
            if (end < 0) break;
            const bracket = pending.slice(0, end + 1);
            if (!/^\[[a-z0-9_-]+\]$/i.test(bracket)) yield { type: 'text', text: bracket };
            pending = pending.slice(end + 1);
          }
        } else if (event.type === 'response.completed') completed = true;
        else if (
          event.type === 'error' ||
          event.type === 'response.failed' ||
          event.type === 'response.incomplete'
        )
          throw new Error('Incomplete response');
      }
      if (!completed) throw new Error('Incomplete response');
      if (pending && !/^\[[a-z0-9_-]*$/i.test(pending)) yield { type: 'text', text: pending };
      yield {
        type: 'sources',
        ids: entries.filter((entry) => text.includes(`[${entry.id}]`)).map((entry) => entry.id),
      };
    },
  };
}
