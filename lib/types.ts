export type Faq = { id: string; title: string; body: string; tags: string[]; requires?: string[] };
export type AnswerInput = {
  question: string;
  entries: Faq[];
  choices?: Faq[];
  signal?: AbortSignal;
};
export type AnswerEvent =
  | { type: 'text'; text: string }
  | { type: 'sources'; ids: string[] }
  | { type: 'clarification'; choices: { id: string; title: string }[] };
export interface AnswerGenerator {
  generate(input: AnswerInput): AsyncIterable<AnswerEvent>;
}
