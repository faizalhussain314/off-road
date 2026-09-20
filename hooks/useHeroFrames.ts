"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  TOTAL_FRAMES,
  INITIAL_BATCH_SIZE,
  BATCH_SIZE,
  getFrameUrl,
  preloadImage,
} from "@/lib/heroFrames";

export interface HeroFramesState {
  isFirstBatchReady: boolean;
  firstBatchProgress: number; // 0 to 100
  totalLoaded: number;
  isAllLoaded: boolean;
  getFrame: (index: number) => HTMLImageElement | null;
  getClosestFrame: (targetIndex: number) => HTMLImageElement | null;
  framesRef: React.MutableRefObject<Map<number, HTMLImageElement>>;
}

// Module-level cache so frames persist across Fast Refresh & React StrictMode re-mounts
const globalFrameCache = new Map<number, HTMLImageElement>();

export function useHeroFrames(): HeroFramesState {
  const [firstBatchProgress, setFirstBatchProgress] = useState<number>(() => {
    return globalFrameCache.size >= INITIAL_BATCH_SIZE ? 100 : 0;
  });
  const [isFirstBatchReady, setIsFirstBatchReady] = useState<boolean>(() => {
    return globalFrameCache.size >= INITIAL_BATCH_SIZE;
  });
  const [totalLoaded, setTotalLoaded] = useState<number>(() => globalFrameCache.size);
  const [isAllLoaded, setIsAllLoaded] = useState<boolean>(() => {
    return globalFrameCache.size >= TOTAL_FRAMES;
  });

  const framesRef = useRef<Map<number, HTMLImageElement>>(globalFrameCache);

  const getFrame = useCallback((index: number): HTMLImageElement | null => {
    return globalFrameCache.get(index) || null;
  }, []);

  const getClosestFrame = useCallback((targetIndex: number): HTMLImageElement | null => {
    if (globalFrameCache.has(targetIndex)) {
      return globalFrameCache.get(targetIndex)!;
    }
    if (globalFrameCache.size === 0) {
      return null;
    }

    let closestIndex = -1;
    let minDistance = Infinity;

    for (const key of globalFrameCache.keys()) {
      const dist = Math.abs(key - targetIndex);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = key;
      }
    }

    return closestIndex !== -1 ? globalFrameCache.get(closestIndex)! : null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check if initial batch is already in global cache
    if (globalFrameCache.size >= INITIAL_BATCH_SIZE) {
      setIsFirstBatchReady(true);
      setFirstBatchProgress(100);
      setTotalLoaded(globalFrameCache.size);
      if (globalFrameCache.size >= TOTAL_FRAMES) {
        setIsAllLoaded(true);
        return;
      }
    }

    let initialLoaded = 0;

    const loadInitialBatch = async () => {
      const promises: Promise<void>[] = [];

      for (let i = 1; i <= INITIAL_BATCH_SIZE; i++) {
        if (globalFrameCache.has(i)) {
          initialLoaded++;
          continue;
        }

        const p = preloadImage(getFrameUrl(i)).then((img) => {
          globalFrameCache.set(i, img);
          if (!isMounted) return;
          initialLoaded++;
          const pct = Math.min(Math.round((initialLoaded / INITIAL_BATCH_SIZE) * 100), 100);
          setFirstBatchProgress(pct);
          setTotalLoaded(globalFrameCache.size);
        });
        promises.push(p);
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      if (!isMounted) return;
      setFirstBatchProgress(100);
      setIsFirstBatchReady(true);

      // Trigger background batches
      loadRemainingBatches(INITIAL_BATCH_SIZE + 1);
    };

    const loadRemainingBatches = (startIndex: number) => {
      if (!isMounted || startIndex > TOTAL_FRAMES) {
        if (isMounted) setIsAllLoaded(true);
        return;
      }

      const endIndex = Math.min(startIndex + BATCH_SIZE - 1, TOTAL_FRAMES);

      const loadChunk = async () => {
        const promises: Promise<void>[] = [];
        for (let i = startIndex; i <= endIndex; i++) {
          if (globalFrameCache.has(i)) continue;
          const p = preloadImage(getFrameUrl(i)).then((img) => {
            globalFrameCache.set(i, img);
            if (!isMounted) return;
            setTotalLoaded(globalFrameCache.size);
          });
          promises.push(p);
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }

        if (!isMounted) return;

        const nextStart = endIndex + 1;
        if (nextStart <= TOTAL_FRAMES) {
          if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            (window as any).requestIdleCallback(() => loadRemainingBatches(nextStart), {
              timeout: 1000,
            });
          } else {
            setTimeout(() => loadRemainingBatches(nextStart), 50);
          }
        } else {
          setIsAllLoaded(true);
        }
      };

      loadChunk();
    };

    loadInitialBatch();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isFirstBatchReady,
    firstBatchProgress,
    totalLoaded,
    isAllLoaded,
    getFrame,
    getClosestFrame,
    framesRef,
  };
}
