"use client";

import React, { useEffect, useRef, useState } from "react";

interface HeroPreloaderProps {
  progress: number; // 0 to 100
  isReady: boolean;
  onComplete: () => void;
}

export function HeroPreloader({ progress, isReady, onComplete }: HeroPreloaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logoBoxRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const isExitedRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    if (!isReady || isExitedRef.current) return;
    isExitedRef.current = true;

    let isMounted = true;

    import("gsap").then(({ default: gsap }) => {
      if (!isMounted) return;

      const tl = gsap.timeline({
        onComplete: () => {
          setIsHidden(true);
          if (containerRef.current) {
            containerRef.current.style.display = "none";
            containerRef.current.style.pointerEvents = "none";
          }
          onCompleteRef.current();
        },
      });

      tl.to(logoBoxRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.inOut",
      }).to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.7,
          ease: "power2.inOut",
        },
        "-=0.2"
      );
    });

    return () => {
      isMounted = false;
    };
  }, [isReady]);

  if (isHidden) {
    return null;
  }

  const formattedProgress = Math.min(Math.max(Math.round(progress), 0), 100)
    .toString()
    .padStart(2, "0");

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-sand-50 p-8 md:p-14 select-none pointer-events-auto transition-opacity"
    >
      <div className="flex items-center justify-between text-xs tracking-tactical text-neutral-500 uppercase font-mono">
        <span>MADPROTEK // PROVING GROUND</span>
        <span className="hidden sm:inline">14–15 NOV 2026 // URIGAM</span>
      </div>

      <div
        ref={logoBoxRef}
        className="flex flex-col items-center justify-center text-center my-auto space-y-4 will-change-transform"
      >
        <div className="mb-2">
          <img
            src="/M-word-logo.png"
            alt="MadProTek Logo"
            className="h-20 w-auto object-contain drop-shadow-md"
          />
        </div>

        <h1 className="font-outfit text-3xl md:text-5xl lg:text-6xl font-black tracking-wider text-neutral-900 uppercase">
          MADPROTEK
        </h1>
        <div className="flex items-center space-x-3">
          <span className="h-[1px] w-6 md:w-10 bg-amber-600/60" />
          <p className="font-satoshi text-xs md:text-sm tracking-tactical uppercase text-amber-700 font-semibold">
            ADVENTURE TRAIL 2026
          </p>
          <span className="h-[1px] w-6 md:w-10 bg-amber-600/60" />
        </div>
      </div>

      <div className="w-full max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs tracking-widest font-mono">
          <span className="text-neutral-500 uppercase">LOADING EXPERIENCE</span>
          <span className="text-amber-700 font-bold">
            {formattedProgress}%
          </span>
        </div>

        <div className="h-[3px] w-full bg-neutral-200 overflow-hidden relative rounded-full">
          <div
            ref={progressBarRef}
            className="h-full bg-amber-600 transition-all duration-150 ease-out shadow-sm"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono tracking-wider">
          <span>BATCH: 01/06 (INITIAL 30 FRAMES)</span>
          <span>4X4 TECHNICAL TELEMETRY</span>
        </div>
      </div>
    </div>
  );
}
