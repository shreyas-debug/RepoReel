import { HeroSection } from "@/components/HomePage/HeroSection";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0F1E]">
      {/* Dot grid + atmosphere orbs — pointer-events none, no click interference */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[120px]"
          aria-hidden
        />
        <div
          className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 translate-y-1/4 rounded-full bg-blue-900/20 blur-[140px]"
          aria-hidden
        />
      </div>
      <HeroSection />
    </div>
  );
}
