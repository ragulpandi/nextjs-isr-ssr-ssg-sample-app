import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TechStore',
  description: 'Your go-to destination for tech reviews and products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
        margin: 0,
        background: '#0d1117',
        color: '#c9d1d9',
      }}>
        {children}
      </body>
    </html>
  );
}
