# Progress log

## 2026-10-31 — Help center assistant

- Added twenty original Demo Plant Shop FAQ entries, deterministic keyword retrieval, delimited prompts and interchangeable mock and server generators.
- Built a responsive chat interface with progressive text, expandable sources, input limits, suggested questions and in-memory conversation history.
- Added request validation, conservative process-local rate limiting, a twenty-second timeout, generic errors and no-store responses. Provider retries and response storage are disabled.
- Verified 21 unit tests covering retrieval, prompt boundaries, generators, provider transport mocks, request guards and chat behavior. No real provider request was made.
- Verified two static browser tests covering grounded sources, unsupported questions, refusal, keyboard input and a 360-pixel viewport. The demo made no external requests or console errors during these checks.
- Formatting, lint, strict type checking, server build and static export passed. The server build includes the API route; the static export excludes it. A local production-server smoke check streamed a mock answer with no-store headers.
- Added two visually checked 1600 × 1200 screenshots, portfolio copy, documentation and CI/Pages workflows.
- TypeScript 7 performs command-line checks; the TypeScript 6 compatibility API supports lint and build tooling.
- Production dependency audit reports zero vulnerabilities. The full audit reports 15 moderate transitive lint-tool findings associated with minimatch; upstream dependency updates remain necessary.
- Next: run remote CI and verify the deployed demo after integration.

## 2026-10-31 — Answer relevance and source presentation

- Normalized shipping, delivery, opening, payment, cancellation, collection and pickup word forms; expanded FAQ tags for realistic questions.
- Prioritized title and tag evidence with keyword specificity, required a clear margin, and rejected generic animal-safety matches without animal context.
- Added a 30-question retrieval evaluation including delivery costs, international delivery, pickup, opening hours, damaged arrivals, cancellation, gift recipients and unsupported payment questions.
- Narrowed override detection to explicit attempts while allowing legitimate recipient questions.
- Removed raw citation ids from mock answers and buffered split citation fragments in provider streams. Source cards still use retrieved citation ids.
- Verified 58 unit tests and three static browser checks, formatting, lint, type checking, server build and static export. Added browser regressions for realistic delivery questions, gift recipients, payment fallback and hidden citation ids.
- Regenerated both 1600 × 1200 portfolio screenshots after changing visible answer text.
