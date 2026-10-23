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
        (window as any).__lenis = lenisInstance;

        lenisInstance.on("scroll", ScrollTrigger.update);

        tickerCb = (time: number) => {
          lenisInstance.raf(time * 1000);
        };

        gsap.ticker.add(tickerCb);
        gsap.ticker.lagSmoothing(0);

        // Check and handle initial hash scroll (e.g. #registration or #register)
        const checkHashScroll = (immediate = false) => {
          const hash = window.location.hash;
          if (hash) {
            const targetId = hash === "#register" ? "registration" : hash.replace("#", "");
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              lenisInstance.scrollTo(targetEl, {
                offset: -64,
                immediate: immediate,
                duration: immediate ? 0 : 1.2,
              });
            }
          }
        };

        requestAnimationFrame(() => checkHashScroll(true));
        setTimeout(() => checkHashScroll(true), 200);
        setTimeout(() => checkHashScroll(true), 600);

        const handleHashChange = () => {
          checkHashScroll(false);
        };
        window.addEventListener("hashchange", handleHashChange);
      } catch (err) {
        console.error("Lenis setup error:", err);
      }
    }

    setup();

    return () => {
      isCancelled = true;
      if (typeof window !== "undefined") {
        delete (window as any).__lenis;
      }
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
