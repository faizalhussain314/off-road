"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, Phone, MessageSquare, Clock, RefreshCw, Radio } from "lucide-react";

export function Registration() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOnlineOpen, setIsOnlineOpen] = useState(false);

  const [formData, setFormData] = useState({
    driverName: "",
    email: "",
    phone: "",
    whatsapp: "",
    vehicleModel: "",
    rigClass: "Extreme Class (35\"+ Lockers)",
    experienceYears: "3-5 Years",
  });

  // Check if online registration is officially opened by admin
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setIsOnlineOpen(json.data.online_registration_open);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_name: formData.driverName,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          vehicle_model: formData.vehicleModel,
          rig_class: formData.rigClass,
          experience_years: formData.experienceYears,
          source: "ONLINE_WEB",
          status: "PENDING_CALL",
          call_notes: `[Web Submission] Driver registered online. Requested entry in ${formData.rigClass}.`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(json.error || "Failed to submit registration. Please try again or call dispatch.");
      }
    } catch (err) {
      setErrorMessage("Network connection error. Please call marshal dispatch directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="registration" className="relative w-full py-24 sm:py-32 bg-sand-100 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Rules & Slot Limit */}
          <div className="lg:col-span-5">
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase mb-3 font-bold">
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
              <span>ENTRY APPLICATION // MADPROTEK 2026</span>
            </div>
            <h2 className="font-outfit text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight leading-tight mb-6">
              STRICTLY LIMITED<br />
              <span className="text-amber-600">25–30 RIGS.</span>
            </h2>

            <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed mb-8 font-medium">
              To preserve proving ground line integrity, zero trail bottlenecking, and ensure comprehensive spotter-to-rig safety, entries are capped at 30 competition rigs. All submissions undergo technical scrutineering review.
            </p>

            <div className="space-y-4 font-sans text-xs sm:text-sm text-neutral-700 border-t border-neutral-200 pt-6 font-medium">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Mandatory 4WD with Low Range Transfer Case & Skid Plates</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Functional Winch (Min 9,000 lbs) & Tree-Trunk Protector Strap</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>4-Point Harness or Certified Roll-Bar Architecture</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Driver + Co-Driver Spotter Pair Required</span>
              </div>
            </div>

            {/* Direct Phone Dispatch Hotline */}
            <div className="mt-8 p-5 bg-white border border-neutral-200 border-l-4 border-l-amber-600 rounded-sm shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs font-bold uppercase">
                <Phone className="w-3.5 h-3.5" />
                <span>PHONE INTAKE & SCRUTINEERING DESK</span>
              </div>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                Currently reserving slots directly via phone call. Call or WhatsApp our marshals to discuss your rig specs and secure a slot.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="tel:+919443200404"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm text-xs font-mono font-bold uppercase"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>+91 94432 004X4</span>
                </a>
                <a
                  href="https://wa.me/919443200404"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-sm text-xs font-mono font-bold uppercase"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WHATSAPP DESK</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form / Callback Request */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-sm p-8 sm:p-12 relative shadow-md">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 border border-amber-300 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-outfit text-2xl sm:text-3xl font-bold uppercase text-neutral-950">
                  APPLICATION RECORDED IN DATABASE
                </h3>
                <p className="font-sans text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-amber-700 font-bold">{formData.driverName}</span>. Your {formData.vehicleModel} details have been logged in our marshal system. Our Scrutineering Lead will call you at <span className="font-mono text-neutral-900 font-bold">{formData.phone}</span> shortly.
                </p>
                <div className="pt-6">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-mono tracking-widest hover:border-amber-600 transition-colors rounded-sm"
                  >
                    SUBMIT ANOTHER VEHICLE
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-outfit text-xl sm:text-2xl font-bold text-neutral-950 uppercase tracking-tight">
                      {isOnlineOpen ? "REGISTER YOUR 4X4 RIG" : "PRE-BOOK & REQUEST CALLBACK"}
                    </h3>
                    {!isOnlineOpen && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase rounded-sm border border-amber-200">
                        ONLINE OPENS SHORTLY
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-neutral-500 uppercase tracking-widest font-semibold">
                    {isOnlineOpen
                      ? "RESERVE ENTRY SCRUTINEERING SLOT"
                      : "RECORD YOUR DETAILS FOR IMMEDIATE PHONE INTAKE & SLOT LOCK"}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-semibold">
                      PRIMARY DRIVER NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-semibold">
                      PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-semibold">
                      WHATSAPP NUMBER
                    </label>
                    <input
                      type="tel"
                      placeholder="Same as phone or separate"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-semibold">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      placeholder="driver@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-semibold">
                      4X4 RIG MAKE & MODEL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thar / Gurkha / Gypsy / Defender"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] tracking-wider text-neutral-700 uppercase mb-1.5 font-semibold">
                      RIG CLASSIFICATION
                    </label>
                    <select
                      value={formData.rigClass}
                      onChange={(e) => setFormData({ ...formData, rigClass: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-sm text-neutral-900 text-sm focus:outline-none focus:border-amber-600 transition-colors font-mono text-xs"
                    >
                      <option>Extreme Class (35&quot;+ Lockers)</option>
                      <option>Pro-Modified (33&quot;–35&quot;)</option>
                      <option>Standard Proving Spec (31&quot;-33&quot;)</option>
                    </select>
                  </div>
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
                        <span>TRANSMITTING DETAILS TO DATABASE...</span>
                      </>
                    ) : (
                      <>
                        <span>{isOnlineOpen ? "SUBMIT RIG APPLICATION" : "REQUEST CALL & LOCK ENTRY SLOT"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="font-mono text-[10px] text-neutral-500 text-center tracking-wider mt-3 uppercase font-medium">
                    SLOT CONFIRMATION SUBJECT TO TECHNICAL SCRUTINEERING & MARSHAL CLEARANCE
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

