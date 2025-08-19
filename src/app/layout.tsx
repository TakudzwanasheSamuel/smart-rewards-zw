import type {Metadata} from 'next';
import { ClientProviders } from "@/components/providers/client-providers";
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Smart Rewards ZW',
  description: 'One Platform. Every Business. Every Customer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased min-h-screen bg-background`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
