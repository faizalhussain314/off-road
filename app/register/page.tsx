import { Registration } from "@/components/sections/Registration";
import { Navbar } from "@/components/navigation/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your 4x4 Rig | MadProTek Adventure Trail 2026",
  description:
    "Official registration for MadProTek 4x4 Adventure Trail 2026. Strictly limited 50+ registrations across 15+ Natural and Technical Obstacles at Urigam Village.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-neutral-900">
      <Navbar />
      <div className="pt-20">
        <Registration />
      </div>
    </main>
  );
}
