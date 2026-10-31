import { retrieve } from './retrieval';
import { isInjection } from './prompt';
import { mockGenerator } from './generators/mock';
import { createRateLimit } from './rate-limit';
import type { AnswerGenerator } from './types';
const headers = { 'Cache-Control': 'no-store' };
export function createAssistHandler(
  generator: AnswerGenerator,
  allow = createRateLimit(),
  timeoutMs = 20_000,
) {
  return async (request: Request) => {
    const error = (message: string, status: number) =>
      Response.json({ error: message }, { status, headers });
    // A shared bucket is conservative on a single local process; do not trust spoofable proxy headers.
    if (!allow('local')) return error('Too many requests. Please try again in a minute.', 429);
    let question: unknown;
    try {
      const body = await request.text();
      if (body.length > 4096) return error('Use a question of 1–500 characters.', 400);
      question = JSON.parse(body).question;
    } catch {
      return error('Enter a valid question.', 400);
    }
    if (typeof question !== 'string' || !question.trim() || question.length > 500)
      return error('Use a question of 1–500 characters.', 400);
    question = question.trim();
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    request.signal.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let rejectAbort: () => void = () => {};
    const aborted = new Promise<never>((_, reject) => {
      rejectAbort = () => reject(new DOMException('Timed out', 'AbortError'));
      controller.signal.addEventListener('abort', rejectAbort, { once: true });
    });
    const cleanup = () => {
      clearTimeout(timer);
      request.signal.removeEventListener('abort', onAbort);
      controller.signal.removeEventListener('abort', rejectAbort);
    };
    const entries = retrieve(question as string);
    const selected = !entries.length || isInjection(question as string) ? mockGenerator : generator;
    const iterator = selected
      .generate({ question: question as string, entries, signal: controller.signal })
      [Symbol.asyncIterator]();
    const next = () => Promise.race([iterator.next(), aborted]);
    try {
      let first = await next();
      let cancelled = false;
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async pull(output) {
          if (cancelled) return;
          try {
            const chunk = first;
            if (chunk.done) {
              cleanup();
              output.close();
              return;
            }
            output.enqueue(encoder.encode(JSON.stringify(chunk.value) + '\n'));
            first = await next();
          } catch {
            if (!cancelled) {
              output.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'error',
                    message: controller.signal.aborted
                      ? 'The answer took too long. Please try again.'
                      : 'Unable to answer right now. Please try again.',
                  }) + '\n',
                ),
              );
              cleanup();
              output.close();
            }
          }
        },
        cancel() {
          cancelled = true;
          controller.abort();
          cleanup();
        },
      });
      return new Response(stream, {
        headers: { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8' },
      });
    } catch {
      cleanup();
      return error(
        controller.signal.aborted
          ? 'The answer took too long. Please try again.'
          : 'Unable to answer right now. Please try again.',
        controller.signal.aborted ? 504 : 502,
      );
    }
  };
}
