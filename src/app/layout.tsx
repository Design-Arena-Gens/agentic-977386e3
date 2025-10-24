import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '80s Animation DNA Prompt Adapter',
  description: 'Upload a PDF and transform prompts with 1980s animation DNA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
