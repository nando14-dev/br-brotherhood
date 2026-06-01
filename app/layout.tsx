import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BR Brotherhood",
  description: "O app oficial do clã BR Brotherhood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}