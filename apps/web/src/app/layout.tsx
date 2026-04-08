import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { WalletProvider } from "@/components/wallet-provider"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Motivation Tok',
  description: 'A Celo MiniApp for daily motivation and streaks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
