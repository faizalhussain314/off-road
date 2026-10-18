"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Download,
} from "lucide-react";

interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
}

const photos: GalleryPhoto[] = [
  {
    id: "photo-1",
    src: "/images/gallery/trench-descent.jpg",
    alt: "Custom 4x4 rig crawling down steep dirt trench",
    title: "Steep Trench Crawl",
    caption: "Custom built 4x4 Jeep navigating the extreme red soil descent chute.",
  },
  {
    id: "photo-2",
    src: "/images/gallery/mud-articulation.jpg",
    alt: "Red Thar tackling muddy off-road trail in green hills",
    title: "Monsoon Mud Trail",
    caption: "Mahindra Thar locked in 4L pushing through wet ruts in the hills.",
  },
  {
    id: "photo-3",
    src: "/images/gallery/steep-ascent.jpg",
    alt: "Red Thar climbing steep incline with front wheel lifted",
    title: "Extreme Incline Assault",
    caption: "Demonstrating raw low-end torque and high approach angle over an earth crest.",
  },
  {
    id: "photo-4",
    src: "/images/gallery/granite-boulder-crawl.jpg",
    alt: "4x4 vehicle crawling on natural granite boulder with spotter",
    title: "Granite Boulder Crawl",
    caption: "Cresting sheer granite bedrock monolith with spotter guidance.",
  },
];

export function EventGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
  }, [lightboxIndex]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : 0
    );
  }, [lightboxIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <section
      id="gallery"
      className="relative w-full py-20 sm:py-28 bg-sand-50 text-neutral-900 border-t border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase mb-3 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>EVENT GALLERY</span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-950">
            PREVIOUS EVENT <span className="text-amber-600">HIGHLIGHTS</span>
          </h2>
          <p className="font-sans text-neutral-600 text-sm sm:text-base mt-3 leading-relaxed">
            Real moments from our previous trail drive — the rigs, the mud, the climbs, and the adrenaline. Click any image to view in full resolution.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/5] bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                loading="lazy"
              />

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Top Zoom Pill */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white inline-flex items-center justify-center border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  PHOTO 0{index + 1}
                </span>
                <h3 className="font-outfit text-lg font-bold uppercase tracking-tight leading-tight mb-1 text-white">
                  {photo.title}
                </h3>
                <p className="text-xs text-neutral-300 font-sans line-clamp-2 opacity-90">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
          onClick={closeLightbox}
        >
          {/* Top Bar with Counter and Close */}
          <div className="absolute top-4 left-0 right-0 px-6 flex items-center justify-between z-50">
            <span className="text-white font-mono text-xs tracking-wider uppercase px-3 py-1.5 bg-neutral-900/80 rounded-full border border-white/10">
              {lightboxIndex + 1} / {photos.length}
            </span>

            <button
              onClick={closeLightbox}
              className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/20 transition-all hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/20 transition-all hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Main Image & Caption */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].alt}
              className="max-h-[72vh] max-w-full object-contain rounded-md shadow-2xl"
            />

            {/* Bottom Caption Bar */}
            <div className="mt-4 text-center max-w-xl">
              <h4 className="font-outfit text-xl font-bold uppercase tracking-tight text-white mb-1">
                {photos[lightboxIndex].title}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 font-sans">
                {photos[lightboxIndex].caption}
              </p>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex items-center space-x-2 mt-4">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    lightboxIndex === idx
                      ? "border-amber-500 scale-105"
                      : "border-neutral-700 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
