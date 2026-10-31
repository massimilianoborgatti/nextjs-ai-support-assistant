import { createAssistHandler } from '../../../lib/assist';
import { createServerGenerator } from '../../../lib/generators/openai';
import { mockGenerator } from '../../../lib/generators/mock';
let handler: ReturnType<typeof createAssistHandler> | undefined;
export async function POST(request: Request) {
  handler ??= createAssistHandler(
    process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here'
      ? createServerGenerator(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL || 'gpt-5-mini')
      : mockGenerator,
  );
  return handler(request);
}
