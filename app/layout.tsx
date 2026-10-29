import type { Metadata } from "next";
import "./globals.css";
import Providers from "./provider";

export const metadata: Metadata = {
  title: "Life Nect",
  description: "一般論よりも経験を繋げるAIチャットサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
