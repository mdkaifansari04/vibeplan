import Image from "next/image";
import { FeatureSection } from "@/components/landing/feature";
import { Hero } from "@/components/landing/hero";
export default function Home() {
  return (
    <main className="flex flex-col ">
      <Hero />
      <div className="container max-w-[80%] mx-auto py-40">
        <FeatureSection />
      </div>
    </main>
  );
}
