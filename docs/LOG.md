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

## 2026-10-31 — Context requirements and clarification

- Moved context restrictions into optional FAQ requires terms, with normalized matching against any required term. Retrieval contains no hard-coded entry identifiers.
- Kept quantity phrasing distinct from cost intent and added data-driven topic requirements for delivery pricing. Expanded FAQ synonyms for arrivals, destinations, returns, order additions, gift messages, contact options and pickup.
- Preserved all previous evaluation cases and added the new recall and unsupported-topic cases: 44 realistic questions now pass.
- Distinguished confident matches, ambiguous matches and unrelated questions. Ambiguity streams a short clarification with two title buttons; selecting a title asks a follow-up question. Both browser mock and server mode share this behavior, without calling the provider for clarification.
- Verified 76 unit tests, including generic requires behavior, clarification buttons and server clarification routing. Formatting, lint, strict type checking, both builds and four static browser checks passed.

## 2026-10-31 — Phrase boundaries and specific evidence

- Multi-word tags are independent normalized phrases. Matching retains word order and internal stop words, so a phrase cannot match isolated, reordered or separated component words. Context requirements use the same phrase boundaries.
- Generic vocabulary such as plant, order, send, get, add, help, need and want cannot admit an entry by itself. A specific title term, specific single-word tag or complete intent phrase is required. An explicit intent phrase can carry meaning that its individual generic words do not; weak body overlap only ranks candidates already admitted by specific evidence.
- Deduplicated normalized evidence and retained the score margin and clarification path. No entry identifiers, country lists or complete-question branches are embedded in retrieval logic.
- Replaced the destination-specific tag with general shipping-area concepts and direction phrases. Expanded contact, tracking, damage and collection concepts with context requirements that distinguish human contact, parcel location, pickup by another person and changes to a delivery recipient or address.
- Kept all 44 earlier evaluation questions and added 12 independently worded questions spanning care, support, collection, delivery changes, gifts, refunds and unsupported generic requests. Added 14 intent-concept questions and direct checks for phrase fragments, reordered words, separated requirements and generic-only input.
- Verified 105 unit tests, formatting, lint, type checking, both production builds and five static browser checks. No real provider calls were made.
