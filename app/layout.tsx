import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewFlow — AI-Powered Google Review Assistant & QR Platform",
  description: "Eliminate consumer friction and generate authentic, compliant Google Business reviews with dynamic QR experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}

