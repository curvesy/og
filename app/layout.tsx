import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import TanstackProvider from "@/components/tanstack-provider";

import { CommandPalette } from "@/components/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OSIRIS - Enterprise AI Document Intelligence Platform",
  description: "Advanced mathematical AI platform for document analysis, risk assessment, and business intelligence. Powered by TDA, causal reasoning, and enterprise-grade AI.",
  keywords: ["OSIRIS", "Enterprise AI", "Document Intelligence", "Mathematical AI", "Risk Assessment", "Business Intelligence", "TDA", "Causal Reasoning"],
  authors: [{ name: "OSIRIS AI Team" }],
  openGraph: {
    title: "OSIRIS - Enterprise AI Document Intelligence",
    description: "Mathematical AI platform transforming document analysis with enterprise-grade intelligence",
    url: "https://osiris.ai",
    siteName: "OSIRIS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OSIRIS - Enterprise AI Document Intelligence",
    description: "Mathematical AI platform for enterprise document analysis and business intelligence",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <TanstackProvider>
          <CopilotKit publicApiKey="ck_pub_2469d78b594580a8c0d10ad4c0a205fc">
            {children}
          </CopilotKit>
          <Toaster />
          <CommandPalette />
        </TanstackProvider>
      </body>
    </html>
  );
}
