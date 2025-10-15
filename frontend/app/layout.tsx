import Footer from "@/components/landing/footer";
import { Header } from "@/components/shared/header";
import { Toaster } from "@/components/ui/toaster";
import { ClientProvider } from "@/provider/client-provider";
import { ThemeProvider } from "@/provider/theme-provider";
import { Analytics } from "@vercel/analytics/next";

import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Vibe Plan",
  description: "Vibe Plan - Your Ultimate AI-Powered Planning Agent for vibe code",
};

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.className} antialiased smooth-scroll`}>
        <ClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            {children}
            <Footer />
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
