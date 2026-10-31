'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import faq from '../content/faq.json';
import { searchFaq } from '../lib/retrieval';
import { mockGenerator } from '../lib/generators/mock';
import { serverTransport } from '../lib/client';
import type { AnswerGenerator } from '../lib/types';
type Message = {
  question: string;
  answer: string;
  sources: string[];
  choices: { id: string; title: string }[];
};
const suggestions = [
  'How long does shipping take?',
  'How do I return a plant?',
  'How often should I water my plant?',
  'What are the pickup opening hours?',
];
export function ChatPanel({
  server = false,
  generator,
}: {
  server?: boolean;
  generator?: AnswerGenerator;
}) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  async function send(text: string) {
    if (active.current || !text.trim() || text.length > 500) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setError('');
    setQuestion('');
    setMessages((previous) => [
      ...previous,
      { question: text.trim(), answer: '', sources: [], choices: [] },
    ]);
    try {
      const selected = generator ?? (server ? serverTransport : mockGenerator);
      const result = searchFaq(text);
      for await (const event of selected.generate({
        question: text.trim(),
        entries: result.kind === 'match' ? result.entries : [],
        choices: result.kind === 'ambiguous' ? result.choices : undefined,
        signal: controller.signal,
      })) {
        if (controller.signal.aborted) break;
        setMessages((previous) =>
          previous.map((message, index) =>
            index !== previous.length - 1
              ? message
              : event.type === 'text'
                ? { ...message, answer: message.answer + event.text }
                : event.type === 'sources'
                  ? { ...message, sources: event.ids }
                  : { ...message, choices: event.choices },
          ),
        );
      }
    } catch {
      if (!controller.signal.aborted) setError('Unable to answer right now. Please try again.');
    } finally {
      active.current = null;
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send(question);
  }
  return (
    <section className="chat" aria-labelledby="chat-title">
      <div className="chat-header">
        <div>
          <span className="eyebrow">YOUR HELP DESK</span>
          <h2 id="chat-title">A little help, rooted in facts.</h2>
        </div>
        <span className="status">
          <span />
          {busy ? 'Answering' : 'Ready to help'}
        </span>
      </div>
      <div className="conversation" aria-label="Conversation">
        {messages.length === 0 && (
          <div className="welcome">
            <div className="leaf" aria-hidden="true">
              ✳
            </div>
            <h3>Let’s find your answer.</h3>
            <p>
              Ask about orders, delivery or caring for your plants.
              <br />
              I’ll show you exactly where the answer comes from.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <article className="exchange" key={index}>
            <div className="question">
              <span>YOU ASKED</span>
              <p>{message.question}</p>
            </div>
            <div className="answer">
              <span className="eyebrow">DEMO PLANT SHOP · ASSISTANT</span>
              <p aria-live="polite" aria-atomic="true" data-testid="answer">
                {message.answer || 'Finding relevant FAQ entries…'}
              </p>
              {message.choices.length > 0 && (
                <div className="suggestions" aria-label="Clarify your question">
                  {message.choices.map((choice) => (
                    <button
                      type="button"
                      key={choice.id}
                      disabled={busy}
                      onClick={() => void send(choice.title)}
                    >
                      {choice.title}
                    </button>
                  ))}
                </div>
              )}
              <div className="sources">
                {message.sources.map((id) => {
                  const entry = faq.find((entry) => entry.id === id);
                  return entry ? (
                    <details key={id}>
                      <summary>
                        <span>↗ {entry.title}</span>
                        <small>{entry.id}</small>
                      </summary>
                      <p>{entry.body}</p>
                    </details>
                  ) : null;
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="composer">
        <p className="suggest-label">A GOOD PLACE TO START</p>
        <div className="suggestions">
          {suggestions.map((text) => (
            <button type="button" key={text} disabled={busy} onClick={() => void send(text)}>
              {text} <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          <label htmlFor="question">Your question</label>
          <div className="input-row">
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={500}
              rows={2}
              placeholder="What would you like to know?"
              disabled={busy}
              aria-describedby="question-count"
            />
            <button className="send" disabled={busy || !question.trim()} type="submit">
              {busy ? 'Answering…' : 'Send question'} <span aria-hidden="true">↗</span>
            </button>
          </div>
          <div className="input-foot">
            <span>Keep personal and payment details out of your question.</span>
            <span id="question-count">{question.length}/500</span>
          </div>
        </form>
      </div>
    </section>
  );
}
