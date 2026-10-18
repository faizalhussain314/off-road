import dynamic from "next/dynamic";
import { Navbar } from "@/components/navigation/Navbar";
import { EventOverview } from "@/components/sections/EventOverview";
import { TrailPreview } from "@/components/sections/TrailPreview";
import { EventGallery } from "@/components/sections/EventGallery";
import { Safety } from "@/components/sections/Safety";
import { Registration } from "@/components/sections/Registration";
import { Contact } from "@/components/sections/Contact";

const Hero = dynamic(() => import("@/components/hero/Hero").then((mod) => mod.Hero), {
  ssr: false,
});

const SmoothScroll = dynamic(
  () => import("@/components/providers/SmoothScroll").then((mod) => mod.SmoothScroll),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen bg-sand-50 text-neutral-900 overflow-x-clip selection:bg-amber-600 selection:text-white">
      <SmoothScroll />
      <Navbar />
      <Hero />
      <EventOverview />
      <TrailPreview />
      <EventGallery />
      <Safety />
      <Registration />
      <Contact />
    </main>
  );
}
