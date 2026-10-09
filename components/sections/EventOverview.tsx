import React from "react";
import { Compass, ShieldCheck, Gauge, Trophy, MapPin, Radio, Activity } from "lucide-react";

export function EventOverview() {
  const highlights = [
    {
      icon: Gauge,
      value: "15+",
      label: "NATURAL & TECHNICAL OBSTACLES",
      desc: "Granite boulder crawl, 35° incline, articulation ridges, riverbed boulder runs, and final gauntlet.",
    },
    {
      icon: ShieldCheck,
      value: "50+",
      label: "REGISTERED RIGS",
      desc: "Regulated vehicle registrations to maintain safety, marshal ratio, and trail integrity.",
    },
    {
      icon: Compass,
      value: "3–4 ACRES",
      label: "PROVING GROUND FOOTPRINT",
      desc: "Raw bedrock terrain in Anchetty-Denkanikottai border corridor.",
    },
    {
      icon: Trophy,
      value: "2 FULL DAYS",
      label: "SATURDAY & SUNDAY",
      desc: "14–15 November 2026. Non-stop technical driving, winching & precision spotting.",
    },
  ];

  return (
    <section id="trail" className="relative w-full py-24 sm:py-32 bg-sand-50 text-neutral-900 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase mb-3 font-bold">
              <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
              <span>OVERVIEW // SOUTH INDIA OFF-ROAD</span>
            </div>
            <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-neutral-950">
              WHERE THE PAVEMENT<br />
              <span className="text-amber-600">BECOMES HISTORY.</span>
            </h2>
          </div>

          <p className="font-sans text-neutral-600 text-sm sm:text-base max-w-md leading-relaxed font-medium">
            South India's premier off-road technical proving ground. Built for purpose-built 4x4 rigs and precision drivers navigating sheer granite monoliths, severe articulation trenches, and steep ridgelines.
          </p>
        </div>

        {/* Live Imagery & Key Telemetry Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Main Visual Feature */}
          <div className="lg:col-span-7 relative rounded-sm overflow-hidden border border-neutral-200 shadow-md group min-h-[380px] sm:min-h-[440px] flex flex-col justify-between">
            <img
              src="/images/overview-rig.jpg"
              alt="4x4 Rig climbing boulder in Urigam"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {/* Dark gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

            {/* Top HUD badge */}
            <div className="relative z-10 p-6 flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono tracking-widest uppercase rounded-sm">
                <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>LIVE TRAIL // URIGAM BOULDER ASCENT</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase rounded-sm shadow-sm">
                PROVING GROUND
              </span>
            </div>

            {/* Bottom HUD Telemetry Strip */}
            <div className="relative z-10 p-6 sm:p-8 text-white">
              <div className="text-amber-400 font-mono text-[11px] tracking-tactical uppercase font-bold mb-1">
                OBSTACLE 01 // ARRIVAL GAUNTLET
              </div>
              <h3 className="font-outfit text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2">
                UNCOMPROMISED GROUND CLEARANCE
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed font-normal">
                Heavily armored rigs articulate across raw granite ledges with front and rear lockers engaged in low-range 1st gear.
              </p>

              <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] font-mono text-neutral-300">
                <span>ELEVATION: 920M MSL</span>
                <span>•</span>
                <span>INCLINE: 35° ASCENT</span>
                <span>•</span>
                <span>SURFACE: RAW GRANITE</span>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards in 2x2 Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="group relative p-6 sm:p-7 bg-white border border-neutral-200 hover:border-amber-600/60 rounded-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-sand-100 border border-neutral-200 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors rounded-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold">
                      0{i + 1}
                    </span>
                  </div>

                  <div>
                    <div className="font-outfit text-2xl sm:text-3xl font-black text-neutral-950 mb-1 group-hover:text-amber-600 transition-colors">
                      {h.value}
                    </div>
                    <div className="font-outfit text-[11px] font-bold text-amber-700 tracking-wider uppercase mb-2">
                      {h.label}
                    </div>
                    <p className="font-sans text-xs text-neutral-600 leading-relaxed font-medium">
                      {h.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location & Corridor Coordinates Strip */}
        <div className="p-8 md:p-10 bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase font-bold mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>COORDINATES // 12.3082° N, 77.6749° E</span>
            </div>
            <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-950">
              URIGAM VILLAGE // ANCHETTY–DENKANIKOTTAI CORRIDOR
            </h3>
            <p className="font-sans text-sm text-neutral-600 mt-2 max-w-2xl font-medium leading-relaxed">
              Strategically positioned 65km south of Hosur near the Bengaluru Tech Corridor, nestled in the rugged transition between the Eastern and Western Ghats.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="px-5 py-3 bg-sand-100 border border-neutral-200 text-center font-mono text-xs rounded-sm">
              <span className="text-neutral-500 block text-[10px] tracking-wider">EVENT DATES</span>
              <span className="text-neutral-950 font-bold">14–15 NOV 2026</span>
            </div>
            <a
              href="#registration"
              className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-outfit font-extrabold text-xs tracking-wider uppercase text-center transition-colors shadow-sm rounded-sm whitespace-nowrap"
            >
              CLAIM A RIG SLOT
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
