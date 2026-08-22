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
  metadataBase: new URL('https://qingzhang-ledger.jliu88000.chatgpt.site'),
  title: '拾账 · 把每一笔，拾进账本',
  description: '把每一笔，拾进自己的账本。没有示例账目，没有复杂流程。',
  icons: {
    icon: '/app-icon.png',
    apple: '/app-icon.png',
  },
  openGraph: {
    title: '拾账 · 把每一笔，拾进账本',
    description: '把每一笔，拾进自己的账本。没有示例账目，没有复杂流程。',
    url: 'https://qingzhang-ledger.jliu88000.chatgpt.site',
    siteName: '拾账',
    locale: 'zh_CN',
    type: 'website',
    images: [{
      url: 'https://qingzhang-ledger.jliu88000.chatgpt.site/og.png',
      width: 1200,
      height: 630,
      alt: '拾账 — 把每一笔，拾进自己的账本',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '拾账 · 把每一笔，拾进账本',
    description: '把每一笔，拾进自己的账本。没有示例账目，没有复杂流程。',
    images: ['https://qingzhang-ledger.jliu88000.chatgpt.site/og.png'],
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
