import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MaintenanceGuard from "@/components/guards/MaintenanceGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VerteX Freelance Marketplace",
  description: "A premium freelance marketplace platform comparable to Fiverr and Upwork.",
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
        <ThemeProvider>
            <MaintenanceGuard>
                {children}
            </MaintenanceGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}

