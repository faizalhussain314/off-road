"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#070809] text-[#f4f2ed] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold uppercase mb-4 text-[#E5A93C]">
          CRITICAL RECOVERY ERROR
        </h2>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#E5A93C] text-[#070809] font-bold text-xs uppercase"
        >
          RESTART TELEMETRY
        </button>
      </body>
    </html>
  );
}
