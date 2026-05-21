import type { Metadata } from "next";
import { Inter, Unbounded } from 'next/font/google'
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const unbounded = Unbounded({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-unbounded',
});

export const metadata: Metadata = {
  title: "Flow | Project Management",
  description: "A premium project management platform for teams that need clarity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
