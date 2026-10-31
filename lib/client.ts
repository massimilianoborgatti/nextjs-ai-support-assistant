import type { AnswerGenerator, AnswerEvent } from './types';
export const serverTransport: AnswerGenerator = {
  async *generate({ question, signal }) {
    const response = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal,
    });
    if (!response.ok || !response.body) throw new Error('Unable to answer');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let pending = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        pending += decoder.decode(value, { stream: !done });
        let end;
        while ((end = pending.indexOf('\n')) >= 0) {
          const event = JSON.parse(pending.slice(0, end));
          pending = pending.slice(end + 1);
          if (event.type === 'error') throw new Error('Unable to answer');
          yield event as AnswerEvent;
        }
        if (done) break;
      }
    } finally {
      await reader.cancel();
    }
  },
};
