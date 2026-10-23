"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Building2,
  Download,
  Mail,
  Award,
  ArrowUpRight,
} from "lucide-react";

export interface SponsorItem {
  id: number;
  name: string;
  logo_url: string;
  tier?: string;
  is_title: boolean;
  is_active: boolean;
  website_url?: string;
  display_order: number;
  created_at?: string;
}

const DEFAULT_SPONSORS: SponsorItem[] = [
  {
    id: 1,
    name: "BFGoodrich Tires",
    logo_url: "/sponsors/bfgoodrich.svg",
    tier: "Official Title Partner",
    is_title: true,
    is_active: true,
    website_url: "https://www.bfgoodrichtires.com",
    display_order: 1,
  },
  {
    id: 2,
    name: "Warn Industries",
    logo_url: "/sponsors/warn.svg",
    tier: "Official Winch & Recovery Partner",
    is_title: false,
    is_active: true,
    website_url: "https://www.warn.com",
    display_order: 2,
  },
  {
    id: 3,
    name: "ARB 4x4 Accessories",
    logo_url: "/sponsors/arb.svg",
    tier: "Overland & Protection Partner",
    is_title: false,
    is_active: true,
    website_url: "https://www.arb.com.au",
    display_order: 3,
  },
  {
    id: 4,
    name: "Old Man Emu",
    logo_url: "/sponsors/oldmanemu.svg",
    tier: "Official Suspension Partner",
    is_title: false,
    is_active: true,
    website_url: "https://www.oldmanemu.com.au",
    display_order: 4,
  },
  {
    id: 5,
    name: "Maxxis Tyres",
    logo_url: "/sponsors/maxxis.svg",
    tier: "Extreme Terrain Traction Partner",
    is_title: false,
    is_active: true,
    website_url: "https://www.maxxis.com",
    display_order: 5,
  },
  {
    id: 6,
    name: "Ironman 4x4",
    logo_url: "/sponsors/ironman4x4.svg",
    tier: "Expedition Equipment Partner",
    is_title: false,
    is_active: true,
    website_url: "https://ironman4x4.com",
    display_order: 6,
  },
];

export function SponsorsShowcase() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>(DEFAULT_SPONSORS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSponsors() {
      try {
        const res = await fetch("/api/sponsors-list", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.sponsors) && data.sponsors.length > 0) {
            if (isMounted) {
              setSponsors(data.sponsors);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load sponsors list:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSponsors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter only active sponsors for the public view
  const activeSponsors = sponsors.filter((s) => s.is_active);
  const titleSponsor = activeSponsors.find((s) => s.is_title);
  const otherSponsors = activeSponsors.filter((s) => !s.is_title);

  return (
    <section
      id="sponsors"
      className="relative w-full py-24 sm:py-32 bg-sand-100 border-t border-neutral-200 overflow-hidden"
    >
      {/* Anchor alias for #obstacles so old bookmarks/links land seamlessly */}
      <span id="obstacles" className="absolute -top-24 pointer-events-none" />

      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase mb-3 font-bold">
              <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>OFFICIAL PARTNERS // MADPROTEK ADVENTURE TRAIL 2026</span>
            </div>
            <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-950 uppercase tracking-tight leading-[1.05]">
              OUR OFFICIAL <br />
              <span className="text-amber-600">SPONSORS &amp; PARTNERS</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-neutral-700 bg-white px-4 py-3 border border-neutral-200 rounded-sm shadow-sm font-semibold max-w-md">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>POWERING SOUTH INDIA&apos;S PREMIER TECHNICAL 4X4 PROVING GROUND</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TITLE SPONSOR SPOTLIGHT (RENDERED ONLY WHEN TITLE EXISTS) */}
        {/* ======================================================== */}
        {titleSponsor && (
          <div className="mb-14">
            <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/60 bg-gradient-to-br from-neutral-950 via-neutral-900 to-[#18181b] p-6 sm:p-10 shadow-xl group">
              {/* Ambient Glow */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Title Sponsor Info */}
                <div className="space-y-4 max-w-2xl text-center lg:text-left">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-mono text-xs tracking-widest uppercase font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>OFFICIAL TITLE SPONSOR</span>
                  </div>

                  <h3 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                    {titleSponsor.name}
                  </h3>

                  <p className="text-neutral-300 text-sm sm:text-base font-sans leading-relaxed">
                    Headline presenter and engineering partner for the 2026 MadProTek Adventure Trail.
                    Setting the benchmark in extreme 4x4 capability, reliability, and precision trail performance.
                  </p>

                  {titleSponsor.website_url && (
                    <div className="pt-2">
                      <a
                        href={titleSponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-outfit font-extrabold text-xs uppercase tracking-wider rounded-md transition-all duration-200 shadow-md hover:scale-105"
                      >
                        <span>VISIT OFFICIAL PARTNER</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Title Sponsor Logo Display */}
                <div className="w-full lg:w-auto flex-shrink-0 flex justify-center">
                  <div className="relative p-6 sm:p-8 rounded-xl bg-white/95 border border-amber-400/40 shadow-2xl flex items-center justify-center min-w-[260px] sm:min-w-[340px] max-w-md h-36 sm:h-44 group-hover:scale-[1.02] transition-transform duration-300">
                    <img
                      src={titleSponsor.logo_url}
                      alt={`${titleSponsor.name} Logo`}
                      className="max-h-24 sm:max-h-28 w-auto max-w-full object-contain filter drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* OTHER SPONSORS & OFFICIAL PARTNERS GRID */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-neutral-300">
            <h3 className="font-outfit text-lg sm:text-xl font-bold uppercase tracking-wide text-neutral-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>
                {titleSponsor ? "OFFICIAL EVENT & EQUIPMENT PARTNERS" : "OFFICIAL EVENT SPONSORS & PARTNERS"}
              </span>
            </h3>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-semibold">
              {otherSponsors.length} PARTNERS
            </span>
          </div>

          {otherSponsors.length === 0 && !titleSponsor ? (
            <div className="text-center py-16 bg-white border border-neutral-200 rounded-lg p-8">
              <Building2 className="w-12 h-12 text-amber-600 mx-auto mb-3 opacity-60" />
              <h4 className="font-outfit text-xl font-bold uppercase text-neutral-900">
                Official Partners Announcing Soon
              </h4>
              <p className="text-neutral-600 text-sm mt-1 max-w-md mx-auto">
                We are finalizing our 2026 brand partnerships and equipment sponsors. Stay tuned or inquire below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {otherSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="group relative bg-white border border-neutral-200 hover:border-amber-500/80 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between items-center text-center overflow-hidden"
                >
                  {/* Subtle hover accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Logo Container */}
                  <div className="w-full h-24 sm:h-28 flex items-center justify-center p-2 rounded-lg bg-neutral-50/60 border border-neutral-100 group-hover:bg-white transition-colors mb-4">
                    <img
                      src={sponsor.logo_url}
                      alt={`${sponsor.name} logo`}
                      className="max-h-16 sm:max-h-20 max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Sponsor Name & Tier */}
                  <div className="w-full">
                    <h4 className="font-outfit font-black text-sm sm:text-base text-neutral-900 uppercase tracking-tight group-hover:text-amber-700 transition-colors truncate">
                      {sponsor.name}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold block mt-1">
                      {sponsor.tier || "Official Partner"}
                    </span>
                  </div>

                  {/* Optional External Link */}
                  {sponsor.website_url ? (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-[10px] font-mono text-amber-700 hover:text-amber-800 font-bold inline-flex items-center space-x-1 uppercase tracking-wider pt-2 border-t border-neutral-100 w-full justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <span>VISIT WEBSITE</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="h-4 mt-3" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SPONSORSHIP CALLOUT STRIP */}
        {/* ======================================================== */}
        <div className="mt-14 p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-amber-500 font-mono text-[10px] tracking-tactical uppercase font-bold">
              BECOME AN OFFICIAL PARTNER
            </span>
            <h4 className="font-outfit text-xl sm:text-2xl font-black uppercase tracking-tight">
              INTERESTED IN SPONSORING MADPROTEK ADVENTURE TRAIL 2026?
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-sans">
              Showcase your automotive, recovery, or overland gear directly to 50+ high-profile rig owners, off-road clubs, and thousands of enthusiast followers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
            <a
              href="/MADPROTEK_Adventure_Trail_2026_Sponsorship_Deck.pdf"
              download
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs uppercase tracking-wider rounded-md border border-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>SPONSOR DECK</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-outfit font-extrabold text-xs uppercase tracking-wider rounded-md transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>INQUIRE NOW</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
