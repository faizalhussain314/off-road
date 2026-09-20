"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";

export interface HeroContentHandle {
  setActiveStage: (stageIndex: number) => void;
}

export const HeroContent = forwardRef<HeroContentHandle>((_, ref) => {
  const [currentStage, setCurrentStage] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    setActiveStage: (index: number) => {
      setCurrentStage(Math.max(0, Math.min(index, 3)));
    },
  }));

  const stages = [
    {
      badge: "STAGE 01 // ARRIVAL",
      heading: "MADPROTEK",
      subheading: "ADVENTURE TRAIL 2026",
      tags: ["DRIVE.", "CONQUER.", "EXPLORE."],
      description:
        "South India's premier 4x4 off-road technical proving ground set against the raw terrain of Urigam Village.",
    },
    {
      badge: "STAGE 02 // THE MACHINE",
      heading: "BUILT FOR",
      highlight: "THE UNEXPECTED.",
      description:
        "High-articulation suspension, locked front & rear differentials, and aggressive off-road rubber built for relentless boulders.",
    },
    {
      badge: "STAGE 03 // THE CHALLENGE",
      heading: "9 TECHNICAL",
      highlight: "OBSTACLE ZONES",
      isObstacles: true,
      description:
        "From the 35° incline ascent to the stone gully and articulation ridges, every zone tests driver nerve and vehicle physics.",
    },
    {
      badge: "STAGE 04 // DESTINATION",
      heading: "MADPROTEK",
      highlight: "4X4 EXPERIENCE",
      subheading: "14–15 NOVEMBER 2026 // URIGAM",
      description:
        "Claim your slot on South India's premier technical proving line. Strictly limited to 25–30 rigs to protect safety and trail integrity.",
      isCTA: true,
    },
  ];

  const obstaclesList = [
    "01 Rock Crawl",
    "02 Articulation Ridge",
    "03 Technical Slalom",
    "04 30° Side Incline",
    "05 Stone Gully",
    "06 Hairpin Trench",
    "07 35° Steep Incline",
    "08 Vertical Step",
    "09 Final Gauntlet",
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10 md:p-16">
      {/* Top Telemetry Header */}
      <div className="flex items-start justify-end w-full pt-16 sm:pt-14 md:pt-12 text-xs font-mono tracking-widest text-neutral-800">
        <div className="text-right flex flex-col items-end bg-white/85 backdrop-blur-md px-3.5 py-2 rounded-sm border border-black/10 shadow-sm">
          <span className="font-bold text-neutral-950 tracking-wider">
            14–15 NOV 2026
          </span>
          <span className="text-[10px] text-amber-700 tracking-tactical uppercase font-semibold">
            URIGAM VILLAGE // SOUTH INDIA
          </span>
        </div>
      </div>

      {/* Main Editorial Stage Presentation (Asymmetric Left / Center-Left) */}
      <div className="relative w-full max-w-2xl lg:max-w-3xl my-auto py-8">
        {stages.map((stg, idx) => {
          const isActive = currentStage === idx;

          return (
            <div
              key={idx}
              className={`transition-all duration-700 ease-out ${
                isActive
                  ? "opacity-100 translate-y-0 pointer-events-auto block"
                  : "opacity-0 translate-y-6 pointer-events-none absolute inset-0"
              }`}
            >
              {/* Badge */}
              {/* <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-sm text-amber-800 text-xs font-mono tracking-tactical uppercase mb-3 shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>{stg.badge}</span>
              </div> */}

              {/* Title Card Container - expanded width and overflow protection */}
              <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-sm border border-black/10 shadow-xl w-full max-w-xl sm:max-w-2xl">
                <h2 className="font-outfit text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 uppercase tracking-tight leading-[0.98] break-words">
                  {stg.heading}
                </h2>

                {stg.subheading && (
                  <p className="font-outfit text-lg sm:text-xl md:text-2xl text-amber-700 font-extrabold uppercase tracking-wider mt-2 mb-2">
                    {stg.subheading}
                  </p>
                )}

                {stg.highlight && (
                  <p className="font-outfit text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-amber-600 uppercase tracking-tight mt-1">
                    {stg.highlight}
                  </p>
                )}

                {stg.tags && (
                  <div className="flex flex-wrap items-center gap-3 font-sans text-xs sm:text-sm text-neutral-700 font-bold tracking-widest uppercase mt-3">
                    {stg.tags.map((t, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span>{t}</span>
                        {i < stg.tags.length - 1 && <span className="text-amber-600">/</span>}
                      </span>
                    ))}
                  </div>
                )}

                {stg.description && (
                  <p className="font-sans text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mt-4">
                    {stg.description}
                  </p>
                )}

                {/* Obstacles list for Stage 3 */}
                {stg.isObstacles && (
                  <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-xs text-neutral-800">
                    {obstaclesList.map((obs, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded text-[11px] font-semibold"
                      >
                        {obs}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA buttons for Stage 4 */}
                {stg.isCTA && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
                    <a
                      href="#registration"
                      className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-outfit font-extrabold text-xs tracking-wider uppercase transition-colors shadow-md"
                    >
                      REGISTER YOUR 4X4
                    </a>
                    <a
                      href="#trail"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 font-outfit font-bold text-xs tracking-wider uppercase transition-colors"
                    >
                      EXPLORE THE TRAIL
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

HeroContent.displayName = "HeroContent";
