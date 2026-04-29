import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI App Compiler",
  description: "Compiler-style app configuration generator with validation, repair, and runtime preview."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
