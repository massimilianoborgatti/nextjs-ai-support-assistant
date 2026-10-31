import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Help center | Demo Plant Shop',
  description: 'Grounded answers from the Demo Plant Shop FAQ, with sources.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
