import { it, expect, vi } from 'vitest';
import { createAssistHandler } from '../lib/assist';
import { createMockGenerator } from '../lib/generators/mock';
import { createRateLimit } from '../lib/rate-limit';
import type { AnswerGenerator } from '../lib/types';
const request = (question: unknown) =>
  new Request('http://localhost/api/assist', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
it('rejects invalid questions', async () => {
  for (const question of ['', 'x'.repeat(501), null])
    expect((await createAssistHandler(createMockGenerator(0))(request(question))).status).toBe(400);
});
it('rate limits the eleventh request', async () => {
  const handler = createAssistHandler(createMockGenerator(0));
  for (let i = 0; i < 10; i++) await (await handler(request('shipping times'))).text();
  const response = await handler(request('shipping times'));
  expect(response.status).toBe(429);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
});
it('expires rate-limit buckets', () => {
  const allow = createRateLimit(1, 100);
  expect(allow('a', 0)).toBe(true);
  expect(allow('a', 1)).toBe(false);
  expect(allow('a', 100)).toBe(true);
});
it('returns 504 when the provider does not respond', async () => {
  vi.useFakeTimers();
  const generator: AnswerGenerator = {
    generate: () => ({ [Symbol.asyncIterator]: () => ({ next: () => new Promise(() => {}) }) }),
  };
  const response = createAssistHandler(generator, () => true, 20)(request('shipping times'));
  await vi.advanceTimersByTimeAsync(30);
  expect((await response).status).toBe(504);
});
it('streams success and never logs input or credentials', async () => {
  const spies = ['log', 'warn', 'error'].map((name) =>
    vi.spyOn(console, name as 'log').mockImplementation(() => {}),
  );
  const response = await createAssistHandler(createMockGenerator(0))(request('shipping times'));
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  const text = await response.text();
  expect(text).toContain('sources');
  expect(text).toContain('ship-01');
  for (const spy of spies) expect(spy).not.toHaveBeenCalled();
});
it('sanitizes provider failures', async () => {
  const generator: AnswerGenerator = {
    generate: () => ({
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          throw Error('private provider details');
        },
      }),
    }),
  };
  const response = await createAssistHandler(generator)(request('shipping times'));
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain('private');
});

it('streams clarification choices without using the provider on ambiguous input', async () => {
  const generate = vi.fn(() => {
    throw Error('Provider must not be used');
  });
  const response = await createAssistHandler({ generate })(request('Tell me about delivery'));
  const events = (await response.text())
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  expect(
    events
      .filter((event) => event.type === 'text')
      .map((event) => event.text)
      .join(''),
  ).toBe('Did you mean…');
  expect(events.find((event) => event.type === 'clarification').choices).toHaveLength(2);
  expect(generate).not.toHaveBeenCalled();
});
