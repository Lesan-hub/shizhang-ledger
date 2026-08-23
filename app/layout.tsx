import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shizhang-accounts.jliu88000.chatgpt.site'),
  title: '拾账 · 账户版',
  description: '为职场人设计的轻量账户与还款管理工具。看清今天，也安排好未来。',
  icons: {
    icon: '/app-icon.png',
    apple: '/app-icon.png',
  },
  openGraph: {
    title: '拾账 · 账户版',
    description: '为职场人设计的轻量账户与还款管理工具。看清今天，也安排好未来。',
    url: 'https://shizhang-accounts.jliu88000.chatgpt.site',
    siteName: '拾账 · 账户版',
    locale: 'zh_CN',
    type: 'website',
    images: [{
      url: 'https://shizhang-accounts.jliu88000.chatgpt.site/og.png',
      width: 1200,
      height: 630,
      alt: '拾账账户版 — 看清今天，也安排好未来',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '拾账 · 账户版',
    description: '为职场人设计的轻量账户与还款管理工具。看清今天，也安排好未来。',
    images: ['https://shizhang-accounts.jliu88000.chatgpt.site/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
