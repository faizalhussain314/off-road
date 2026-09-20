import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-charcoal-950 text-offwhite flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-amber-accent text-xs tracking-tactical uppercase mb-2">
        ERROR // 404
      </div>
      <h1 className="font-syne text-4xl sm:text-6xl font-black uppercase text-offwhite tracking-tightest mb-4">
        TRAILHEAD NOT FOUND
      </h1>
      <p className="font-satoshi text-offwhite-muted text-sm max-w-md mb-8">
        The coordinates you entered are off the mapped technical grid. Return to the main staging area.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-amber-accent text-charcoal-950 font-syne font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(229,169,60,0.3)]"
      >
        RETURN TO PROVING GROUND
      </Link>
    </div>
  );
}
