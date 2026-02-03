import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aether Exchange | Sell Crypto. Get Paid Globally.',
  description: 'Premium crypto-to-fiat exchange with manual verification and instant status updates.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-midnight">
        {children}
      </body>
    </html>
  );
}
