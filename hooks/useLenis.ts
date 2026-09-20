"use client";

import { useEffect, useRef } from "react";

export function useLenis() {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lenisInstance: any = null;
    let tickerCb: ((time: number) => void) | null = null;
    let isCancelled = false;

    async function setup() {
      try {
        const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (isCancelled) return;

        gsap.registerPlugin(ScrollTrigger);

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
        });

        lenisRef.current = lenisInstance;

        lenisInstance.on("scroll", ScrollTrigger.update);

        tickerCb = (time: number) => {
          lenisInstance.raf(time * 1000);
        };

        gsap.ticker.add(tickerCb);
        gsap.ticker.lagSmoothing(0);
      } catch (err) {
        console.error("Lenis setup error:", err);
      }
    }

    setup();

    return () => {
      isCancelled = true;
      if (lenisInstance) {
        if (tickerCb) {
          import("gsap").then(({ default: gsap }) => {
            if (tickerCb) gsap.ticker.remove(tickerCb);
          });
        }
        lenisInstance.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return lenisRef;
}
