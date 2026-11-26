import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalShare — Local Wi-Fi File Sharing',
  description: 'Share folders on your local network quickly and securely',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
