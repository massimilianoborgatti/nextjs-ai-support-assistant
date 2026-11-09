import type { Metadata } from 'next';
import './globals.css';

const title = 'Help center | Demo Plant Shop';
const pagesDescription =
  'Try a support assistant that answers questions about a fictional plant shop using its FAQ and shows the sources.';
const pagesUrl = new URL('https://massimilianoborgatti.github.io/nextjs-ai-support-assistant/');
const preview = {
  url: 'social-preview.png',
  width: 1200,
  height: 630,
  alt: 'Demo Plant Shop help center showing a shipping answer and its FAQ source.',
};

export const metadata: Metadata = {
  title,
  description: 'Grounded answers from the Demo Plant Shop FAQ, with sources.',
  ...(process.env.BUILD_TARGET === 'pages'
    ? {
        metadataBase: pagesUrl,
        description: pagesDescription,
        openGraph: {
          title,
          description: pagesDescription,
          type: 'website',
          url: pagesUrl,
          images: [preview],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description: pagesDescription,
          images: [{ url: preview.url, alt: preview.alt }],
        },
      }
    : {}),
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
