"use client";

import React from "react";

interface ScrollIndicatorProps {
  opacity?: number;
}

export function ScrollIndicator({ opacity = 1 }: ScrollIndicatorProps) {
  return (
    <div
      className="flex flex-col items-center pointer-events-none transition-opacity duration-300 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 shadow-sm"
      style={{ opacity }}
    >
      <span className="font-satoshi text-[10px] md:text-xs tracking-tactical uppercase text-neutral-800 font-bold mb-2">
        SCROLL TO ADVANCE
      </span>
      <div className="w-[2px] h-8 bg-neutral-200 relative overflow-hidden rounded-full">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-amber-600 animate-scroll-line" />
      </div>
    </div>
  );
}
