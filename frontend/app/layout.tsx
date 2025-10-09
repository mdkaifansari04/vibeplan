import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Sidemenu from "@/components/sidemenu/sidemenu";
import StarCuicuiGithubButton from "@/components/sidemenu/start-github-button";
import { AddressBar } from "@/components/shared/address-bar";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/shared/header";
import { Toaster } from "@/components/ui/toaster";
import "./styles/globals.css";
import { StickyFooter } from "@/components/shared/sticky-footer";
import Footer from "@/components/landing/footer";

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
    <html lang="en">
      <body className={`${figtree.className} antialiased smooth-scroll`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
