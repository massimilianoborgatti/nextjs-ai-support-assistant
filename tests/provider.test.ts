import { it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const create = vi.hoisted(() => vi.fn());
vi.mock('openai', () => ({
  default: class {
    responses = { create };
  },
}));
import { createServerGenerator } from '../lib/generators/openai';
import { retrieve } from '../lib/retrieval';
it('streams provider deltas and only exposes retrieved citations', async () => {
  create.mockResolvedValue(
    (async function* () {
      yield {
        type: 'response.output_text.delta',
        delta: 'Delivery takes three to five working days. [shi',
      };
      yield { type: 'response.output_text.delta', delta: 'p-01] [unknown]' };
      yield { type: 'response.completed' };
    })(),
  );
  const generator = createServerGenerator('your-api-key-here', 'configured-model');
  const events = [];
  for await (const event of generator.generate({
    question: 'shipping times',
    entries: retrieve('shipping times'),
  }))
    events.push(event);
  const visible = events
    .filter((event) => event.type === 'text')
    .map((event) => event.text)
    .join('');
  expect(visible).toContain('Delivery takes three to five working days.');
  expect(visible).not.toContain('[');
  expect(events.at(-1)).toEqual({ type: 'sources', ids: ['ship-01'] });
  expect(create.mock.calls[0][0]).toMatchObject({
    store: false,
    stream: true,
    max_output_tokens: 500,
    model: 'configured-model',
  });
});
it('does not treat a failed provider stream as a completed answer', async () => {
  create.mockResolvedValue(
    (async function* () {
      yield { type: 'response.failed' };
    })(),
  );
  const generator = createServerGenerator('your-api-key-here', 'configured-model');
  await expect(
    (async () => {
      for await (const event of generator.generate({
        question: 'shipping times',
        entries: retrieve('shipping times'),
      }))
        void event;
    })(),
  ).rejects.toThrow('Incomplete response');
});
