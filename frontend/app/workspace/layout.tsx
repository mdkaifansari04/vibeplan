import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidemenu from "@/components/sidemenu/sidemenu";
import StarCuicuiGithubButton from "@/components/sidemenu/start-github-button";
import { AddressBar } from "@/components/shared/address-bar";
import "./styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-(--breakpoint-2xl)">
      <Sidemenu />
      <div className="lg:ml-80">
        <AddressBar />
        <main className=" p-4 pt-12 md:p-6">
          <div className="space-y-10 pb-20">{children}</div>
        </main>
        <div className="flex sm:hidden fixed bottom-6 left-2">
          <StarCuicuiGithubButton />
        </div>
      </div>
    </div>
  );
}
