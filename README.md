# Demo Plant Shop — Help center assistant

A small Next.js help-center assistant that answers only from the shop's own FAQ, keeps the API key on the server, and shows its sources. The public demo uses deterministic simulated responses entirely in the browser. A separate local server mode connects the same retrieval pipeline to a configurable provider.

[Live demo](https://massimilianoborgatti.github.io/nextjs-ai-support-assistant/) · [Repository](https://github.com/massimilianoborgatti/nextjs-ai-support-assistant)

## How it works

```text
Question → keyword retrieval → up to three FAQ entries
                              ↓
                       mock / server generator
                              ↓
                       streamed answer + sources
```

Twenty original entries cover the fictional Demo Plant Shop. Retrieval scores titles, tags and bodies, removes stop words, normalizes simple plurals and sorts ties by entry id. The mock quotes its best entry. Unsupported questions receive a contact suggestion; obvious instruction overrides are refused.

The server prompt separates rules from delimited FAQ data and user input. Prompt boundaries are not a guarantee against every injection or unsupported claim. Sources include only retrieved ids cited in the answer. Evaluate model answers before consequential use.

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Without a key, answers use the browser mock. History exists only in component memory and disappears on reload.

For server mode, copy `.env.example` to `.env.local`, replace `your-api-key-here` with your server credential and optionally set `OPENAI_MODEL`. Restart the development server. The mode badge explains that questions go to the provider. Never use a public environment variable for credentials.

```sh
npm run build
npm start
```

The normal build includes `POST /api/assist`. It validates questions, applies a shared process-local limit of ten requests per minute, sets a twenty-second timeout and returns generic errors with no-store headers. The shared bucket is conservative for local use; forwarded client headers are not trusted.

## Static demo

```sh
npm run build:pages
npm run preview
```

Open http://127.0.0.1:4500/nextjs-ai-support-assistant/. The export excludes TypeScript route handlers using page extensions and renders the browser mock regardless of server environment settings. Run a normal build again before `npm start`.

## Tests

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run build:pages
npx playwright install chromium
npm run e2e
npm run screenshots
```

Unit tests cover retrieval, prompt boundaries, mock streaming, sources, unsupported questions, refusals, validation, limits, timeout, generic failures, logging and the chat UI. Browser tests use the static build under its deployed base path, check narrow screens and assert that requests stay on the local origin. No test needs credentials or calls a provider.

CI checks pull requests and main pushes without secrets. Pages deploys only after successful main push CI from the same repository. Two portfolio screenshots are generated from the static build.

## Production notes

- Store credentials in server environment settings. Keep them out of browser bundles, responses and logs.
- Replace the process-local limit with a shared store and a trusted client identifier before scaling. Add authentication, edge request-size enforcement and abuse monitoring for a public API.
- Set provider budgets, alerts and request limits. Output tokens, disabled retries and timeout bound individual requests; they are not a total spending cap.
- Log duration and status, avoiding questions and personal information.
- Obtain consent before sending personal data to a provider. Visitors are asked to omit personal and payment details. Response storage is disabled, but provider retention policies still need review.
- Implement `AnswerGenerator` to swap providers. The server adapter streams Responses API text deltas: [streaming documentation](https://developers.openai.com/api/docs/guides/streaming-responses).
- Add retrieval evaluation, citation validation and human escalation for real support. Keyword relevance does not establish that every part of a question is covered. The mock is an extractive demonstration.

## Stack and license

Next.js App Router, React, strict TypeScript, Vitest, React Testing Library, Playwright, ESLint and Prettier. Versions are recorded in `package-lock.json`.

[MIT](LICENSE) · [massimilianoborgatti](https://github.com/massimilianoborgatti)
