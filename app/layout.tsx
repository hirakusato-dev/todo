import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "やること帳",
  description: "手書き風ToDoノート",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
