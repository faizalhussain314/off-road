"use client";

import React, { useState } from "react";
import {
  Download,
  FileText,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  Crown,
  Zap,
  Award,
  Layers,
  Camera,
  Users,
} from "lucide-react";

export function Sponsors() {
  const [formMode, setFormMode] = useState<"INQUIRY" | "INVOICE">("INQUIRY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    tierInterest: "Title Partner (₹3,50,000)",
    brandCategory: "Automotive / 4x4 OEM",
    gstNumber: "",
    billingAddress: "",
    message: "",
  });

  const sponsorshipTiers = [
    {
      id: "title",
      name: "TITLE PARTNER",
      badge: "EXCLUSIVE // NAMING RIGHTS",
      price: "₹3,50,000",
      icon: Crown,
      featured: true,
      popular: true,
      deliverables: [
        "Exclusive Naming Rights: '[Your Brand] MadProTek Adventure Trail 2026'",
        "Dominant Bonnet + Front Doors Decal Placement on all participating rigs",
        "Main Entry Arch Dominant Branding & Main Stage Backdrop Naming",
        "All 15+ Natural & Technical Obstacles Naming Rights & Track Banners",
        "20×20 ft Premium On-Ground Display Pavilion & Demo Pit",
        "3 Complimentary 4x4 Vehicle Entries + 8 VIP Hospitality Passes",
        "Dedicated 4K Brand Cutdown Video + Keynote Trophy Handover Speech",
        "100% Direct Customer & Participant Commercial Lead Handover",
      ],
    },
    {
      id: "powered",
      name: "POWERED BY PARTNER",
      badge: "CATEGORY EXCLUSIVE",
      price: "₹2,00,000",
      icon: Zap,
      featured: false,
      popular: false,
      deliverables: [
        "Official Co-Presenting Status: 'MadProTek Adventure Trail Powered By [Brand]'",
        "Quarter Panels Decal Placement on all competition rigs",
        "Prominent Main Entry Arch Branding & Stage Strip",
        "3 Natural & Technical Obstacles Naming Rights & Track Banners",
        "15×15 ft On-Ground Experience Booth in Partner Pavilion",
        "2 Complimentary 4x4 Vehicle Entries + 6 VIP Hospitality Passes",
        "Dedicated Social Feature Video Reel & Media Interview",
        "Opt-In Participant & Spectator Commercial Lead Handover",
      ],
    },
    {
      id: "gold",
      name: "GOLD PARTNER",
      badge: "CATEGORY LEAD",
      price: "₹1,00,000",
      icon: Award,
      featured: false,
      popular: false,
      deliverables: [
        "Category Lead Partner Status across all event promotions",
        "Fender & Rear Glass Decal Placement on all vehicles",
        "Logo Strip on Event Entry Arch & Digital Sponsor Wall",
        "2 Natural & Technical Obstacles Naming Rights & Banners",
        "10×10 ft On-Ground Display Booth in Partner Pavilion",
        "1 Complimentary 4x4 Vehicle Entry + 4 VIP Hospitality Passes",
        "Dedicated Brand Social Feature Reel & Commemorative Trophy",
        "QR Scan Direct Commercial Lead Generation Access",
      ],
    },
    {
      id: "silver",
      name: "SILVER PARTNER",
      badge: "SUPPORTING PARTNER",
      price: "₹50,000",
      icon: Layers,
      featured: false,
      popular: false,
      deliverables: [
        "Official Supporting Brand Partner recognition across channels",
        "Official Sponsor Strip Decal on participating vehicles",
        "1 Obstacle Track Banner & Perimeter Branding Flag",
        "Shared 10×10 ft Display Table in Partner Pavilion",
        "4 VIP Spectator Passes & Lunch Hospitality for representatives",
        "Co-branded Welcome Social Feature & Participation Memento",
        "Full Access to 300+ High-Resolution Post-Event Photo Archive",
        "Official Tax Invoice & Sponsorship Contract Provided",
      ],
    },
  ];

  const handleSelectTier = (tierName: string, price: string) => {
    setFormData((prev) => ({
      ...prev,
      tierInterest: `${tierName} (${price})`,
    }));
    const formElement = document.getElementById("sponsor-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInvoiceClick = () => {
    setFormMode("INVOICE");
    const formElement = document.getElementById("sponsor-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: formData.companyName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          tier_interest: formData.tierInterest,
          request_type: formMode === "INVOICE" ? "REQUEST_INVOICE" : "SPONSORSHIP_INQUIRY",
          brand_category: formData.brandCategory,
          gst_number: formData.gstNumber,
          billing_address: formData.billingAddress,
          message: formData.message,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(json.error || "Failed to submit sponsorship request. Please try again or contact dispatch.");
      }
    } catch {
      setErrorMessage("Network error. Please contact our Brand Partnership Desk directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="sponsors" className="relative w-full py-24 sm:py-32 bg-sand-50 text-neutral-900 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase mb-3 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>BRAND PARTNERSHIPS // AUTOMOTIVE PROVING GROUND</span>
            </div>
            <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-neutral-950">
              ELEVATE YOUR BRAND AT SOUTH INDIA&apos;S<br />
              <span className="text-amber-600">PREMIER 4X4 ADVENTURE TRAIL</span>
            </h2>
          </div>

          <p className="font-sans text-neutral-600 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
            More than a logo. An immersive experiential platform uniting motorsport adrenaline, driver skill, and commercial brand engagement across 50+ registered rigs and high-net-worth audiences.
          </p>
        </div>

        {/* User Recommended Action Bar */}
        <div className="mb-16 p-6 sm:p-8 bg-white border border-neutral-200 shadow-md rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-mono tracking-widest text-amber-700 uppercase font-bold">
              OFFICIAL SPONSORSHIP PORTAL // 14–15 NOVEMBER 2026
            </span>
            <h3 className="font-outfit text-xl sm:text-2xl font-black text-neutral-950 uppercase tracking-tight">
              SECURE YOUR BRAND VISIBILITY
            </h3>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 font-medium">
              Limited brand allotments per category. Download the dossier or request an official invoice.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            {/* Main CTA */}
            <a
              href="#sponsor-form"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-outfit font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md hover:scale-[1.02] rounded-sm whitespace-nowrap"
            >
              <span>BECOME A SPONSOR →</span>
            </a>

            {/* Secondary CTA */}
            <a
              href="/MADPROTEK_Adventure_Trail_2026_Sponsorship_Deck.pdf"
              download="MADPROTEK_Adventure_Trail_2026_Sponsorship_Deck.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-outfit font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm rounded-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>DOWNLOAD SPONSOR DECK</span>
            </a>

            {/* Alternative CTA */}
            <button
              onClick={handleInvoiceClick}
              type="button"
              className="inline-flex items-center space-x-2 px-5 py-3.5 bg-white hover:bg-sand-100 text-neutral-900 border border-neutral-300 font-outfit font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm rounded-sm whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>REQUEST AN INVOICE</span>
            </button>
          </div>
        </div>

        {/* Partnership Tiers Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-amber-700 font-mono text-xs tracking-wider uppercase font-bold mb-1">
                TIER ARCHITECTURE // PACKAGES
              </div>
              <h3 className="font-outfit text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
                OFFICIAL SPONSORSHIP PACKAGES
              </h3>
            </div>
            <span className="hidden sm:inline-block font-mono text-xs text-neutral-500 uppercase">
              GST APPLICABLE // OFFICIAL TAX INVOICE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.id}
                  className={`bg-white rounded-sm p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border relative ${
                    tier.featured
                      ? "border-amber-600 ring-2 ring-amber-600/20 shadow-lg -translate-y-1"
                      : "border-neutral-200 hover:border-amber-600/60 shadow-sm hover:shadow-md"
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 right-6 px-3 py-1 bg-amber-600 text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded-sm shadow-sm">
                      MOST POPULAR
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-sm border ${
                        tier.featured
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-sand-100 text-amber-700 border-neutral-200"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-bold">
                        {tier.badge}
                      </span>
                    </div>

                    <h4 className="font-outfit font-black text-xl text-neutral-950 uppercase tracking-tight mb-1">
                      {tier.name}
                    </h4>

                    <div className="flex items-baseline space-x-1 mb-6 pb-4 border-b border-neutral-100">
                      <span className="font-outfit text-3xl font-black text-amber-600">
                        {tier.price}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500 uppercase">
                        + GST
                      </span>
                    </div>

                    <ul className="space-y-3 font-sans text-xs text-neutral-700 font-medium mb-8">
                      {tier.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTier(tier.name, tier.price)}
                      className={`w-full py-3 font-outfit font-bold text-xs tracking-wider uppercase text-center transition-colors rounded-sm ${
                        tier.featured
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                          : "bg-neutral-900 hover:bg-neutral-800 text-white"
                      }`}
                    >
                      APPLY FOR {tier.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectTier(tier.name, tier.price);
                        setFormMode("INVOICE");
                      }}
                      className="w-full py-2 bg-transparent hover:bg-neutral-50 text-neutral-600 text-[11px] font-mono tracking-wider uppercase transition-colors"
                    >
                      REQUEST INVOICE →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sponsor ROI & Impact Telemetry */}
        <div className="mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-outfit text-2xl font-black text-neutral-950">50+ RIGS</div>
              <div className="font-outfit text-[11px] font-bold text-amber-700 uppercase">QUALIFIED PARTICIPANTS</div>
              <p className="font-sans text-xs text-neutral-600 mt-1">High-net-worth 4x4 owners, founders, and automotive executives.</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="font-outfit text-2xl font-black text-neutral-950">300+ 4K ASSETS</div>
              <div className="font-outfit text-[11px] font-bold text-amber-700 uppercase">MEDIA PRODUCTION</div>
              <p className="font-sans text-xs text-neutral-600 mt-1">Full commercial usage rights on photography, video masters & drone cutdowns.</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-outfit text-2xl font-black text-neutral-950">15+ OBSTACLES</div>
              <div className="font-outfit text-[11px] font-bold text-amber-700 uppercase">BRAND ACTIVATION GATES</div>
              <p className="font-sans text-xs text-neutral-600 mt-1">On-ground branding at natural rock crawls, inclines & spectator zones.</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-outfit text-2xl font-black text-neutral-950">14-DAY AUDIT</div>
              <div className="font-outfit text-[11px] font-bold text-amber-700 uppercase">ROI REPORTING</div>
              <p className="font-sans text-xs text-neutral-600 mt-1">Comprehensive verified impressions, lead handover & engagement analytics.</p>
            </div>
          </div>
        </div>

        {/* Sponsor Form Anchor */}
        <div id="sponsor-form" className="bg-white border border-neutral-200 rounded-sm shadow-xl p-8 sm:p-12 lg:p-16">
          <div className="max-w-4xl mx-auto">
            {submitted ? (
              <div className="py-12 text-center space-y-5">
                <div className="w-16 h-16 bg-amber-50 border border-amber-300 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-outfit text-2xl sm:text-3xl font-black uppercase text-neutral-950">
                  {formMode === "INVOICE" ? "INVOICE REQUEST DISPATCHED" : "SPONSORSHIP INQUIRY LOGGED"}
                </h3>
                <p className="font-sans text-sm sm:text-base text-neutral-600 max-w-lg mx-auto leading-relaxed font-medium">
                  Thank you, <span className="text-amber-700 font-bold">{formData.contactPerson}</span> from{" "}
                  <span className="text-neutral-950 font-bold">{formData.companyName}</span>. Your interest in{" "}
                  <span className="font-mono text-neutral-900 font-bold">{formData.tierInterest}</span> has been routed to our Commercial Director.
                </p>

                <div className="p-4 bg-sand-100 border border-neutral-200 rounded-sm max-w-md mx-auto text-xs font-mono text-neutral-700 space-y-1">
                  <div>DISPATCH CONTACT: <span className="font-bold">+91 81483 21138 / +91 84891 99319</span></div>
                  <div>OFFICIAL EMAIL: <span className="font-bold">madprotekcorp@gmail.com</span></div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <a
                    href="/MADPROTEK_Adventure_Trail_2026_Sponsorship_Deck.pdf"
                    download="MADPROTEK_Adventure_Trail_2026_Sponsorship_Deck.pdf"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-outfit font-bold text-xs tracking-wider uppercase transition-colors rounded-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD SPONSOR DECK (PDF)</span>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-outfit font-bold text-xs tracking-wider uppercase transition-colors rounded-sm"
                  >
                    SUBMIT ANOTHER INQUIRY
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Form Mode Selector Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-neutral-200 gap-4">
                  <div>
                    <span className="text-amber-700 font-mono text-xs tracking-wider uppercase font-bold block mb-1">
                      COMMERCIAL INTAKE PORTAL
                    </span>
                    <h3 className="font-outfit text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
                      {formMode === "INVOICE" ? "REQUEST AN OFFICIAL TAX INVOICE" : "BECOME AN OFFICIAL SPONSOR"}
                    </h3>
                  </div>

                  <div className="inline-flex p-1 bg-neutral-100 border border-neutral-200 rounded-sm">
                    <button
                      type="button"
                      onClick={() => setFormMode("INQUIRY")}
                      className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-colors rounded-sm ${
                        formMode === "INQUIRY"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      SPONSOR INQUIRY
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMode("INVOICE")}
                      className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-colors rounded-sm ${
                        formMode === "INVOICE"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      REQUEST INVOICE
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-sm">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-bold">
                        COMPANY / BRAND NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Continental Tyres / ARB 4x4"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-bold">
                        CONTACT PERSON & TITLE *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar (Marketing Head)"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-bold">
                        CORPORATE EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="partnerships@brand.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-bold">
                        DIRECT MOBILE / PHONE *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-bold">
                        PARTNERSHIP TIER OF INTEREST *
                      </label>
                      <select
                        value={formData.tierInterest}
                        onChange={(e) => setFormData({ ...formData, tierInterest: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors font-mono text-xs"
                      >
                        <option>Title Partner (₹3,50,000)</option>
                        <option>Powered By Partner (₹2,00,000)</option>
                        <option>Gold Partner (₹1,00,000)</option>
                        <option>Silver Partner (₹50,000)</option>
                        <option>Custom Strategic Package (Custom Budget)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-bold">
                        BRAND INDUSTRY CATEGORY
                      </label>
                      <select
                        value={formData.brandCategory}
                        onChange={(e) => setFormData({ ...formData, brandCategory: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors font-mono text-xs"
                      >
                        <option>Automotive / 4x4 OEM</option>
                        <option>Tyres & Wheels Manufacturer</option>
                        <option>Suspension & Heavy 4x4 Armour</option>
                        <option>Overland & Camping Equipment</option>
                        <option>Engine Oil, Lubricants & Fuel</option>
                        <option>Lifestyle, Energy Drinks & Beverage</option>
                        <option>Fintech, Banking & Insurance</option>
                        <option>Action Cameras & Tech Media</option>
                        <option>Other Commercial Enterprise</option>
                      </select>
                    </div>
                  </div>

                  {/* Invoice Specific Fields */}
                  {formMode === "INVOICE" && (
                    <div className="p-5 bg-sand-100 border border-amber-600/30 rounded-sm space-y-4">
                      <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs font-bold uppercase">
                        <FileText className="w-4 h-4" />
                        <span>TAX INVOICE & GST DETAILS FOR CONTRACT GENERATION</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1 font-bold">
                            GSTIN NUMBER (IF APPLICABLE)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 33AAAAA0000A1Z5"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1 font-bold">
                            REGISTERED BILLING ADDRESS
                          </label>
                          <input
                            type="text"
                            placeholder="Corporate Registered Address"
                            value={formData.billingAddress}
                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-bold">
                      SPECIAL DELIVERABLE GOALS OR ACTIVATION NOTES
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify product demonstration goals, preferred booth layout, custom video needs, or questions for our commercial team..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-outfit font-black text-sm tracking-wider uppercase flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:scale-[1.01] rounded-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>DISPATCHING PARTNERSHIP APPLICATION...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {formMode === "INVOICE"
                              ? "SUBMIT & REQUEST OFFICIAL TAX INVOICE →"
                              : "TRANSMIT SPONSORSHIP APPLICATION →"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="font-mono text-[10px] text-neutral-500 text-center tracking-wider mt-3 uppercase font-semibold">
                      OFFICIAL SPONSORSHIP ALLOTMENT CONFIRMATION PROVIDED WITHIN 24 HOURS
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Commercial Contact Footer Strip */}
        <div className="mt-12 p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-700 uppercase font-bold tracking-widest">
              DIRECT BRAND PARTNERSHIP CONSOLE
            </span>
            <div className="font-outfit font-bold text-neutral-950 text-sm sm:text-base">
              HAVE BESPOKE BRAND ACTIVATION OR ENTERPRISE DEMO REQUIREMENTS?
            </div>
            <p className="font-sans text-xs text-neutral-600">
              Speak directly with our Track Director & Commercial Strategy Desk.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:madprotekcorp@gmail.com"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 text-neutral-800 border border-neutral-300 rounded-sm text-xs font-mono font-bold uppercase transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>madprotekcorp@gmail.com</span>
            </a>
            <a
              href="tel:+918148321138"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm text-xs font-mono font-bold uppercase transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+91 81483 21138</span>
            </a>
            <a
              href="tel:+918489199319"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm text-xs font-mono font-bold uppercase transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+91 84891 99319</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
