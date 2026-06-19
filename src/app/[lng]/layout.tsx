import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { i18n, type Locale } from '@/i18n-config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingChatBot from '@/components/FloatingChatBot';
import LeadForm from '@/components/LeadForm';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lng: locale }));
}

export const metadata: Metadata = {
  title: 'Alser | Window Treatments',
  description: 'High-quality window treatments, blinds, and curtains with free measurement.',
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: Locale };
}) {
  return (
    <html lang={params.lng}>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Navbar lng={params.lng} />
        <main className="min-h-screen">{children}</main>
        <Footer lng={params.lng} />
        <FloatingChatBot lng={params.lng} />
        <LeadForm lng={params.lng} />
      </body>
    </html>
  );
}
