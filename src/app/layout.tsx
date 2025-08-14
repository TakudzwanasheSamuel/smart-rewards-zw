import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { PT_Sans, Source_Code_Pro } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-source-code-pro',
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
      <body className={`${ptSans.variable} ${sourceCodePro.variable} font-body antialiased min-h-screen bg-background`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
