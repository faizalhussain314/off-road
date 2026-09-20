"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useHeroFrames } from "@/hooks/useHeroFrames";
import { TOTAL_FRAMES } from "@/lib/heroFrames";
import { HeroCanvas, HeroCanvasHandle } from "./HeroCanvas";
import { HeroContent, HeroContentHandle } from "./HeroContent";
import { HeroPreloader } from "./HeroPreloader";

interface HeroProps {
  onHeroReady?: () => void;
}

export function Hero({ onHeroReady }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HeroCanvasHandle>(null);
  const heroContentRef = useRef<HeroContentHandle>(null);

  const [hasCompletedPreload, setHasCompletedPreload] = useState<boolean>(false);

  const currentFrameRef = useRef<number>(1);
  const targetFrameRef = useRef<number>(1);
  const lastStageIndexRef = useRef<number>(0);
  const lastRenderedFrameRef = useRef<number>(1);
  const rafIdRef = useRef<number | null>(null);

  const {
    isFirstBatchReady,
    firstBatchProgress,
    getClosestFrame,
  } = useHeroFrames();

  // Update target frame and stage dynamically based on continuous scroll progress
  const updateProgress = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollableDist = rect.height - window.innerHeight;
    if (scrollableDist <= 0) return;

    const currentScroll = -rect.top;
    const progress = Math.min(Math.max(currentScroll / scrollableDist, 0), 1);

    // Continuous smooth target frame mapping across all frames without discrete stopping checkpoints
    targetFrameRef.current = 1 + progress * (TOTAL_FRAMES - 1);

    // Calculate which editorial stage is active (0 to 3)
    const stageIndex = Math.min(Math.floor(progress * 4), 3);
    if (lastStageIndexRef.current !== stageIndex) {
      lastStageIndexRef.current = stageIndex;
      heroContentRef.current?.setActiveStage(stageIndex);
    }
  }, []);

  // Smooth inertial frame interpolation loop (Lazy Lerp)
  useEffect(() => {
    const loop = () => {
      // Synchronously poll container position on every animation frame for fluid Lenis integration
      updateProgress();

      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.01) {
        // Snappy, responsive smooth lerp factor: faster video scrubbing speed
        const next = current + diff * 0.16;
        currentFrameRef.current = next;
        const rounded = Math.round(next);
        if (rounded !== lastRenderedFrameRef.current && heroCanvasRef.current) {
          lastRenderedFrameRef.current = rounded;
          heroCanvasRef.current.renderFrame(rounded);
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [updateProgress]);

  // Handle preloader complete
  const handlePreloaderComplete = () => {
    setHasCompletedPreload(true);
    if (onHeroReady) onHeroReady();

    currentFrameRef.current = 1;
    targetFrameRef.current = 1;
    lastRenderedFrameRef.current = 1;
    if (heroCanvasRef.current) {
      heroCanvasRef.current.renderFrame(1);
    }
    if (heroContentRef.current) {
      heroContentRef.current.setActiveStage(0);
    }
    updateProgress();
  };

  // Scroll and resize listener
  useEffect(() => {
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  // Initial draw
  useEffect(() => {
    if (isFirstBatchReady) {
      updateProgress();
    }
  }, [isFirstBatchReady, updateProgress]);

  return (
    <>
      <HeroPreloader
        progress={firstBatchProgress}
        isReady={isFirstBatchReady}
        onComplete={handlePreloaderComplete}
      />

      {/* Hero Scroll Container - reduced height for faster video scrubbing */}
      <section
        ref={containerRef}
        className="relative w-full h-[220vh] sm:h-[260vh] lg:h-[300vh] bg-sand-50"
      >
        {/* Sticky 100vh Viewport */}
        <div
          ref={stickyRef}
          className="sticky top-0 w-full h-screen overflow-hidden bg-sand-50"
        >
          <div
            ref={canvasWrapperRef}
            className="absolute inset-0 w-full h-full will-change-transform opacity-100"
          >
            {/* Raw video frame canvas without dark overlays */}
            <HeroCanvas
              ref={heroCanvasRef}
              getClosestFrame={getClosestFrame}
              isReady={isFirstBatchReady}
            />
          </div>

          {/* Stepped Editorial Scene Presentation */}
          <HeroContent ref={heroContentRef} />
        </div>
      </section>
    </>
  );
}
