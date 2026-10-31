import { connection } from 'next/server';
import { ChatPanel } from '../components/chat-panel';
export default async function Home() {
  if (process.env.BUILD_TARGET !== 'pages') await connection();
  const server =
    process.env.BUILD_TARGET !== 'pages' &&
    Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here');
  return (
    <>
      <header className="site-header">
        <a href="#" className="brand">
          <span aria-hidden="true">✳</span> Demo Plant Shop
        </a>
        <span className="header-label">THE HELP CENTER</span>
        <a href="https://github.com/massimilianoborgatti/nextjs-ai-support-assistant">
          View source ↗
        </a>
      </header>
      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">GOOD QUESTIONS. GROUNDED ANSWERS.</p>
            <h1>
              A helping hand
              <br />
              for your <em>growing things.</em>
            </h1>
            <p className="intro">
              From the first delivery to the next new leaf.
              <br />
              Find clear answers from our shop’s own help center.
            </p>
          </div>
          <div className="hero-stamp">
            <span aria-hidden="true">✳</span>
            <p>
              Small questions.
              <br />
              Thoughtful answers.
            </p>
            <small>DEMO PLANT SHOP / HELP CENTER</small>
          </div>
        </section>
        <div className="mode-badge">
          {server
            ? 'Server mode — your question is sent to the configured AI provider. Do not include personal data.'
            : 'Demo mode — simulated AI responses, no data leaves your browser'}
        </div>
        <div className="workspace">
          <ChatPanel server={server} />
          <aside>
            <div className="how">
              <p className="eyebrow">A LOOK UNDER THE LEAVES</p>
              <h2>How it works</h2>
              <ol>
                <li>
                  <span>01</span>
                  <div>
                    <strong>Ask a question</strong>
                    <p>Start with something about the shop.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Find relevant FAQ entries</strong>
                    <p>Simple keyword matching finds useful information.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Answer from those entries</strong>
                    <p>No matching information? We’ll say so.</p>
                  </div>
                </li>
                <li>
                  <span>04</span>
                  <div>
                    <strong>Show the sources</strong>
                    <p>Open a source card to read the original entry.</p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="key-note">
              <span aria-hidden="true">⌁</span>
              <h3>Why the API key never reaches the browser</h3>
              <p>
                The published demo needs no key. In server mode, a server-only route reads the key
                and calls the provider. The browser receives the answer, never the credential.
              </p>
            </div>
            <p className="aside-note">
              A fictional shop. Original FAQ content.
              <br />
              No accounts, orders or contact requests are submitted here.
            </p>
          </aside>
        </div>
      </main>
      <footer>
        <span>
          Demo Plant Shop <span aria-hidden="true">✳</span> A small example of careful software.
        </span>
        <a href="https://github.com/massimilianoborgatti/nextjs-ai-support-assistant">
          Source & documentation ↗
        </a>
        <span>MIT licensed</span>
      </footer>
    </>
  );
}
