export type Faq = { id: string; title: string; body: string; tags: string[] };
export type AnswerInput = { question: string; entries: Faq[]; signal?: AbortSignal };
export type AnswerEvent = { type: 'text'; text: string } | { type: 'sources'; ids: string[] };
export interface AnswerGenerator {
  generate(input: AnswerInput): AsyncIterable<AnswerEvent>;
}
