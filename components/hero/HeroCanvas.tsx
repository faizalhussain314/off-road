"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface HeroCanvasHandle {
  renderFrame: (frameIndex: number) => void;
}

interface HeroCanvasProps {
  getClosestFrame: (index: number) => HTMLImageElement | null;
  isReady: boolean;
}

const SOURCE_WIDTH = 1920;
const SOURCE_HEIGHT = 1080;

export const HeroCanvas = forwardRef<HeroCanvasHandle, HeroCanvasProps>(
  ({ getClosestFrame, isReady }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const lastWidthRef = useRef<number>(0);
    const currentFrameRef = useRef<number>(1);
    const posterImageRef = useRef<HTMLImageElement | null>(null);

    const drawImageOnCanvas = (img: HTMLImageElement | HTMLCanvasElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const viewportWidth = canvas.clientWidth || window.innerWidth;
      const viewportHeight = canvas.clientHeight || window.innerHeight;
      if (viewportWidth === 0 || viewportHeight === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.round(viewportWidth * dpr);
      const targetHeight = Math.round(viewportHeight * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const scale = Math.max(viewportWidth / SOURCE_WIDTH, viewportHeight / SOURCE_HEIGHT);
      const destWidth = SOURCE_WIDTH * scale;
      const destHeight = SOURCE_HEIGHT * scale;
      const destX = (viewportWidth - destWidth) / 2;
      const destY = (viewportHeight - destHeight) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, destX, destY, destWidth, destHeight);
      ctx.restore();
    };

    const renderFrame = (frameIndex: number) => {
      currentFrameRef.current = frameIndex;
      const img = getClosestFrame(frameIndex);
      if (img && img.complete && img.naturalWidth > 0) {
        drawImageOnCanvas(img);
      } else if (posterImageRef.current && posterImageRef.current.complete && posterImageRef.current.naturalWidth > 0) {
        drawImageOnCanvas(posterImageRef.current);
      }
    };

    useImperativeHandle(ref, () => ({
      renderFrame,
    }));

    // Preload poster image for instant background display
    useEffect(() => {
      const poster = new Image();
      poster.onload = () => {
        posterImageRef.current = poster;
        renderFrame(currentFrameRef.current);
      };
      poster.src = "/video-poster.webp";
      if (poster.complete && poster.naturalWidth > 0) {
        posterImageRef.current = poster;
        renderFrame(currentFrameRef.current);
      }
    }, []);

    // Re-draw when isReady becomes true
    useEffect(() => {
      if (isReady) {
        renderFrame(currentFrameRef.current);
      }
    }, [isReady]);

    // Handle responsive resize
    useEffect(() => {
      lastWidthRef.current = window.innerWidth;

      const handleResize = () => {
        const newWidth = window.innerWidth;
        if (Math.abs(newWidth - lastWidthRef.current) < 10) {
          return;
        }
        lastWidthRef.current = newWidth;
        renderFrame(currentFrameRef.current);
      };

      window.addEventListener("resize", handleResize, { passive: true });
      window.addEventListener("orientationchange", handleResize, { passive: true });

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none will-change-transform"
      />
    );
  }
);

HeroCanvas.displayName = "HeroCanvas";
