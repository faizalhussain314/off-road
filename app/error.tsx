"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Telemetry Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-charcoal-950 text-offwhite flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-amber-accent text-xs tracking-tactical uppercase mb-2">
        TELEMETRY INTERRUPTED
      </div>
      <h2 className="font-syne text-3xl sm:text-5xl font-black uppercase text-offwhite tracking-tightest mb-4">
        RECOVERY OVERRIDE
      </h2>
      <p className="font-satoshi text-offwhite-muted text-sm max-w-md mb-8">
        An unexpected sensor discrepancy occurred. Re-engaging differential system.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-amber-accent text-charcoal-950 font-syne font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(229,169,60,0.3)]"
      >
        RE-ENGAGE SYSTEM
      </button>
    </div>
  );
}
