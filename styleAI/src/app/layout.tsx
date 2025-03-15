import type { Metadata } from 'next';
import { Playfair_Display, Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Style-AI - Personalized Fashion Recommendations',
  description: 'AI-powered fashion recommendations tailored to your style',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${inter.variable} ${geistMono.variable} font-inter antialiased`}
        suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
