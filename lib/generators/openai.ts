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
      let completed = false;
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') {
          text += event.delta;
          yield { type: 'text', text: event.delta };
        } else if (event.type === 'response.completed') completed = true;
        else if (
          event.type === 'error' ||
          event.type === 'response.failed' ||
          event.type === 'response.incomplete'
        )
          throw new Error('Incomplete response');
      }
      if (!completed) throw new Error('Incomplete response');
      yield {
        type: 'sources',
        ids: entries.filter((entry) => text.includes(`[${entry.id}]`)).map((entry) => entry.id),
      };
    },
  };
}
