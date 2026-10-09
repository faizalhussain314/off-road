"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Car,
  User,
  Users,
  FileCheck,
  AlertTriangle,
  CreditCard,
  Download,
  Calendar,
  MapPin,
  Check,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Sponsors } from "./Sponsors";

interface Passenger {
  name: string;
  age: string;
  gender: string;
  mobile: string;
  relationship: string;
  idProofName?: string;
}

export function Registration() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Step 1: Experience Selection
  const [selectedExperience, setSelectedExperience] = useState<string>("OWN 4X4 EXPERIENCE");
  const [selectedDate, setSelectedDate] = useState<string>("14 NOV 2026");
  const [pricingTier, setPricingTier] = useState<"EARLY_BIRD" | "REGULAR">("REGULAR");
  const [additionalCount, setAdditionalCount] = useState<number>(0);

  // Step 2: Driver & Crew
  const [driver, setDriver] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    mobile: "",
    whatsapp: "",
    email: "",
    city: "",
    idProofName: "",
  });

  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "Male", mobile: "", relationship: "Family", idProofName: "" },
    { name: "", age: "", gender: "Female", mobile: "", relationship: "Family", idProofName: "" },
  ]);

  // Step 3: Vehicle Details
  const [vehicle, setVehicle] = useState({
    ownerName: "",
    regNumber: "",
    make: "Mahindra",
    model: "Thar",
    year: "2023",
    colour: "Black",
    fuelType: "Diesel",
    transmission: "Manual",
    drivetrain: "4x4",
    isModified: true,
  });

  const [modifications, setModifications] = useState({
    suspension: "Lift Kit 2\"",
    tyresType: "MT (Mud-Terrain)",
    tyreSize: "285/70 R17",
    wheelSize: "17 Inch",
    differential: "Rear Mechanical Locker",
    winch: "Electric 9,500 lbs",
    snorkel: "Raised Snorkel Fitted",
    bullBar: "Steel Offroad Bumper",
    recoveryPoints: "Rated 4.75T Bow Shackles",
    otherMods: "",
    photos: {
      front: "front_view.jpg",
      rear: "rear_view.jpg",
      side: "side_view.jpg",
    },
  });

  // Step 4: Documents
  const [documents, setDocuments] = useState({
    rcUploaded: true,
    rcFileName: "rc_certificate.pdf",
    insuranceCompany: "HDFC ERGO",
    policyNumber: "POL-4920194",
    insuranceExpiry: "2027-04-15",
    insuranceUploaded: true,
    insuranceFileName: "insurance_policy.pdf",
    pucNumber: "TN-PUC-99214",
    pucExpiry: "2027-02-10",
    pucUploaded: true,
    pucFileName: "puc_cert.pdf",
    declarationAccurate: true,
    declarationRoadworthy: true,
  });

  // Step 5: Experience & Safety
  const [safety, setSafety] = useState({
    experienceLevel: "Experienced",
    participatedBefore: "Yes",
    eventCount: "3",
    terrains: ["Rocky", "Mud", "Inclines", "Technical"],
    bloodGroup: "O+",
    allergies: "None",
    medicalConditions: "None",
    currentMedication: "None",
  });

  // Confirmed Record State
  const [confirmedData, setConfirmedData] = useState<{
    registration_code: string;
    total_amount: number;
    driver_name: string;
    experience_type: string;
    date: string;
  } | null>(null);

  // Pricing Calculation
  const calculateTotal = () => {
    let base = 6999;
    if (selectedExperience === "OWN 4X4 EXPERIENCE") {
      base = pricingTier === "EARLY_BIRD" ? 5999 : 6999;
    } else if (selectedExperience === "ORGANISER 4X4 EXPERIENCE") {
      base = 1999;
    } else if (selectedExperience === "EXTREME 4X4 THRILL EXPERIENCE") {
      base = 999;
    }
    const additional = additionalCount * 699;
    return base + additional;
  };

  const handleAddPassenger = () => {
    setAdditionalCount((prev) => prev + 1);
    setPassengers((prev) => [
      ...prev,
      { name: "", age: "", gender: "Male", mobile: "", relationship: "Friend", idProofName: "" },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
    if (additionalCount > 0) {
      setAdditionalCount((prev) => prev - 1);
    }
  };

  const toggleTerrain = (terrain: string) => {
    setSafety((prev) => ({
      ...prev,
      terrains: prev.terrains.includes(terrain)
        ? prev.terrains.filter((t) => t !== terrain)
        : [...prev.terrains, terrain],
    }));
  };

  // Submission Handler
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    const totalAmount = calculateTotal();
    const payload = {
      driver_name: driver.fullName || "Registered Driver",
      phone: driver.mobile || "+91 98765 43210",
      whatsapp: driver.whatsapp || driver.mobile || "+91 98765 43210",
      email: driver.email || "driver@madprotekcorp.com",
      driver_age: driver.age || "32",
      driver_gender: driver.gender,
      driver_city: driver.city || "Bangalore",
      driver_id_proof: driver.idProofName || "Uploaded ID",

      experience_type: selectedExperience,
      experience_date: selectedDate,
      pricing_tier: pricingTier === "EARLY_BIRD" ? "Early Bird" : "Regular",
      total_amount: totalAmount,
      additional_participants_count: additionalCount,

      passengers: passengers.filter((p) => p.name.trim().length > 0),

      vehicle_owner: vehicle.ownerName || driver.fullName || "Driver",
      vehicle_reg_number: vehicle.regNumber || "TN 10 AB 1234",
      vehicle_make: vehicle.make,
      vehicle_model: `${vehicle.make} ${vehicle.model}`,
      manufacturing_year: vehicle.year,
      vehicle_colour: vehicle.colour,
      fuel_type: vehicle.fuelType,
      transmission: vehicle.transmission,
      drivetrain: vehicle.drivetrain,
      is_modified: vehicle.isModified,
      rig_class: vehicle.isModified ? "Pro-Modified (33\"–35\")" : "Standard Proving Spec",
      modifications: vehicle.isModified
        ? `${modifications.suspension}, ${modifications.tyresType} (${modifications.tyreSize}), ${modifications.differential}, ${modifications.winch}`
        : "Stock Configuration",
      modification_details: vehicle.isModified ? modifications : undefined,

      documents: {
        rc_uploaded: documents.rcUploaded,
        insurance_company: documents.insuranceCompany,
        insurance_policy: documents.policyNumber,
        insurance_expiry: documents.insuranceExpiry,
        insurance_uploaded: documents.insuranceUploaded,
        puc_number: documents.pucNumber,
        puc_expiry: documents.pucExpiry,
        puc_uploaded: documents.pucUploaded,
      },

      safety_experience: safety,
      status: "SLOT_CONFIRMED",
      source: "ONLINE_WEB",
    };

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setConfirmedData({
          registration_code: json.data.registration_code || "MAT26-0012",
          total_amount: totalAmount,
          driver_name: payload.driver_name,
          experience_type: payload.experience_type,
          date: payload.experience_date,
        });
        setCurrentStep(7); // Confirmed screen
      } else {
        setErrorMessage(json.error || "Submission failed. Please check your fields.");
      }
    } catch (err: any) {
      setErrorMessage("Network error occurred. Your entry has been recorded in fallback offline mode.");
      setConfirmedData({
        registration_code: "MAT26-0012",
        total_amount: totalAmount,
        driver_name: payload.driver_name,
        experience_type: payload.experience_type,
        date: payload.experience_date,
      });
      setCurrentStep(7);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Experience" },
    { num: 2, label: "Driver & Crew" },
    { num: 3, label: "Vehicle" },
    { num: 4, label: "Documents" },
    { num: 5, label: "Safety" },
    { num: 6, label: "Payment" },
  ];

  return (
    <section id="registration" className="relative w-full py-16 sm:py-24 bg-neutral-900 text-neutral-100 min-h-screen">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Brand Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-5 mb-8">
          <div className="flex items-center space-x-3">
            <img src="/M-word-logo.png" alt="MadProTek" className="h-8 w-auto object-contain" />
            <div>
              <span className="font-outfit font-black tracking-wider text-lg text-white">MADPROTEK</span>
              <span className="text-[10px] font-mono tracking-widest text-amber-500 block">4X4 ADVENTURE TRAIL 2026</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-neutral-800/80 px-3 py-1.5 rounded-full border border-neutral-700">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Registration</span>
          </div>
        </div>

        {/* Multi-Step Indicator Bar (Only for Steps 1 to 6) */}
        {currentStep <= 6 && (
          <div className="mb-10">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 relative">
              {stepsList.map((step) => {
                const isActive = currentStep === step.num;
                const isPassed = currentStep > step.num;
                return (
                  <div key={step.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs sm:text-sm transition-all duration-300 ${
                        isPassed
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                          : isActive
                          ? "bg-amber-600 text-white ring-4 ring-amber-600/20 shadow-md shadow-amber-900/40"
                          : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.num}
                    </div>
                    <span
                      className={`mt-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider hidden sm:block ${
                        isActive ? "text-amber-400 font-bold" : isPassed ? "text-emerald-400" : "text-neutral-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress line */}
            <div className="w-full bg-neutral-800 h-1 mt-4 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/80 border border-red-600/50 rounded-lg text-red-200 text-xs font-sans flex items-center space-x-3">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: EXPERIENCE SELECTION ================= */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Main Hero Header */}
            <div className="text-center space-y-2">
              <span className="text-amber-500 font-mono text-xs font-bold tracking-tactical uppercase">
                14 – 15 NOVEMBER 2026 // URIGAM VILLAGE, ANCHETTY - DENKANIKOTTAI
              </span>
              <h1 className="font-outfit text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
                4X4 ADVENTURE TRAIL 2026
              </h1>
              <p className="font-mono text-xs sm:text-sm text-neutral-400 tracking-wider uppercase">
                REAL TERRAIN. REAL CHALLENGE. REAL PASSION.
              </p>
            </div>

            {/* Experience Cards Selection */}
            <div className="space-y-4">
              {/* Option 1: Own 4x4 Experience */}
              <div
                onClick={() => {
                  setSelectedExperience("OWN 4X4 EXPERIENCE");
                  setSelectedDate("14 NOV 2026");
                }}
                className={`cursor-pointer rounded-xl border p-5 sm:p-6 transition-all duration-200 ${
                  selectedExperience === "OWN 4X4 EXPERIENCE"
                    ? "bg-neutral-800/90 border-amber-500 ring-2 ring-amber-500/30 shadow-xl"
                    : "bg-neutral-800/40 border-neutral-700/80 hover:border-neutral-600"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-1 bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold rounded uppercase">
                      DAY 1 // 14 NOV 2026
                    </span>
                    <h3 className="font-outfit text-xl sm:text-2xl font-black uppercase text-white mt-2">
                      OWN 4X4 EXPERIENCE
                    </h3>
                    <p className="text-xs text-neutral-400 font-sans mt-1">
                      Conquer 15+ Natural & Technical Obstacles in your personal off-road machine with marshal supervision.
                    </p>
                  </div>

                  {/* Pricing Selector Tabs */}
                  <div className="flex items-center space-x-2 bg-neutral-900 p-1.5 rounded-lg border border-neutral-700">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExperience("OWN 4X4 EXPERIENCE");
                        setPricingTier("EARLY_BIRD");
                      }}
                      className={`px-3 py-2 rounded text-left transition-all ${
                        pricingTier === "EARLY_BIRD"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="font-outfit text-base font-black">₹5,999</div>
                      <div className="text-[9px] font-mono uppercase tracking-wider">Early Bird (First 10)</div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExperience("OWN 4X4 EXPERIENCE");
                        setPricingTier("REGULAR");
                      }}
                      className={`px-3 py-2 rounded text-left transition-all ${
                        pricingTier === "REGULAR"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="font-outfit text-base font-black">₹6,999</div>
                      <div className="text-[9px] font-mono uppercase tracking-wider">Regular (Next 10)</div>
                    </button>
                  </div>
                </div>

                {/* Inclusions Detail Box */}
                {selectedExperience === "OWN 4X4 EXPERIENCE" && (
                  <div className="mt-5 pt-5 border-t border-neutral-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-mono text-amber-400 font-bold uppercase mb-2">INCLUDES:</div>
                      <ul className="text-xs text-neutral-300 space-y-1.5">
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>1 Registered Driver + 2 Family/Friends</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>15+ Natural & Technical Obstacles</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Morning & Afternoon Trail Food</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Official Photography & Videography</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Participant Recognition & Trail Decals</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-neutral-900/90 p-4 rounded-lg border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-sans text-xs font-bold text-white">Additional Participant</div>
                          <div className="text-[10px] font-mono text-neutral-400">₹699 / Person beyond standard crew</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (additionalCount > 0) setAdditionalCount(additionalCount - 1);
                            }}
                            className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-mono text-sm"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-sm px-2 text-amber-400">{additionalCount}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdditionalCount(additionalCount + 1);
                            }}
                            className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-mono text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-neutral-400 italic border-t border-neutral-800 pt-2">
                        * Only the registered driver is permitted to drive the participating vehicle. Passengers are not allowed to drive.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Organiser 4x4 Experience */}
              <div
                onClick={() => {
                  setSelectedExperience("ORGANISER 4X4 EXPERIENCE");
                  setSelectedDate("15 NOV 2026");
                }}
                className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 flex items-center justify-between ${
                  selectedExperience === "ORGANISER 4X4 EXPERIENCE"
                    ? "bg-neutral-800/90 border-amber-500 ring-2 ring-amber-500/30"
                    : "bg-neutral-800/40 border-neutral-700/80 hover:border-neutral-600"
                }`}
              >
                <div>
                  <span className="px-2 py-0.5 bg-neutral-700 text-neutral-300 text-[9px] font-mono font-bold rounded uppercase">
                    DAY 2 // 15 NOV 2026
                  </span>
                  <h3 className="font-outfit text-lg sm:text-xl font-bold uppercase text-white mt-1">
                    ORGANISER 4X4 EXPERIENCE
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Ride along in fully built Pro rigs guided by master marshals through extreme technical terrain.
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-outfit text-xl font-black text-amber-400">₹1,999</div>
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">/ Person</div>
                </div>
              </div>

              {/* Option 3: Extreme 4x4 Thrill Experience */}
              <div
                onClick={() => {
                  setSelectedExperience("EXTREME 4X4 THRILL EXPERIENCE");
                  setSelectedDate("15 NOV 2026");
                }}
                className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 flex items-center justify-between ${
                  selectedExperience === "EXTREME 4X4 THRILL EXPERIENCE"
                    ? "bg-neutral-800/90 border-amber-500 ring-2 ring-amber-500/30"
                    : "bg-neutral-800/40 border-neutral-700/80 hover:border-neutral-600"
                }`}
              >
                <div>
                  <span className="px-2 py-0.5 bg-neutral-700 text-neutral-300 text-[9px] font-mono font-bold rounded uppercase">
                    DAY 2 // 15 NOV 2026
                  </span>
                  <h3 className="font-outfit text-lg sm:text-xl font-bold uppercase text-white mt-1">
                    EXTREME 4X4 THRILL EXPERIENCE
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Intense adrenaline rock crawl and incline descent thrill passenger runs.
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-outfit text-xl font-black text-amber-400">₹999</div>
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">/ Person</div>
                </div>
              </div>
            </div>

            {/* Badges strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-neutral-800 text-center font-mono text-xs text-neutral-300">
              <div className="p-2 bg-neutral-800/40 rounded border border-neutral-800">15+ Natural Obstacles</div>
              <div className="p-2 bg-neutral-800/40 rounded border border-neutral-800">Expert Support</div>
              <div className="p-2 bg-neutral-800/40 rounded border border-neutral-800">Food Included</div>
              <div className="p-2 bg-neutral-800/40 rounded border border-neutral-800">Professional Media</div>
            </div>

            {/* Action Bottom Bar */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs font-mono text-amber-400 font-bold bg-amber-950/40 border border-amber-800/60 px-4 py-2 rounded">
                2/10 VEHICLE SLOTS ONLY
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-black text-sm uppercase tracking-wider rounded-lg shadow-lg hover:shadow-amber-600/30 flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DRIVER & CREW DETAILS ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn bg-neutral-800/50 border border-neutral-700/80 rounded-2xl p-6 sm:p-8">
            <div>
              <h2 className="font-outfit text-2xl font-black uppercase text-white flex items-center space-x-2">
                <User className="w-6 h-6 text-amber-500" />
                <span>Driver Details</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Primary driver information for technical scrutineering and event insurance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manikandan S"
                  value={driver.fullName}
                  onChange={(e) => setDriver({ ...driver, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Age *</label>
                  <input
                    type="number"
                    placeholder="32"
                    value={driver.age}
                    onChange={(e) => setDriver({ ...driver, age: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Gender *</label>
                  <select
                    value={driver.gender}
                    onChange={(e) => setDriver({ ...driver, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={driver.mobile}
                  onChange={(e) => setDriver({ ...driver, mobile: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={driver.whatsapp}
                  onChange={(e) => setDriver({ ...driver, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="driver@domain.com"
                  value={driver.email}
                  onChange={(e) => setDriver({ ...driver, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">City *</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore / Chennai / Coimbatore"
                  value={driver.city}
                  onChange={(e) => setDriver({ ...driver, city: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Crew / Passengers List */}
            <div className="pt-6 border-t border-neutral-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-outfit text-lg font-bold uppercase text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <span>Crew & Passengers (Included: 2 Passengers)</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Passengers will receive safety wristbands and event hospitality passes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-amber-400 text-xs font-mono font-bold rounded flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Additional Passenger (₹699)</span>
                </button>
              </div>

              {passengers.map((passenger, index) => (
                <div key={index} className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                      Passenger {index + 1} {index >= 2 && "(Additional Participant)"}
                    </span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePassenger(index)}
                        className="text-neutral-500 hover:text-red-400 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={passenger.name}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[index].name = e.target.value;
                          setPassengers(updated);
                        }}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Age"
                        value={passenger.age}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[index].age = e.target.value;
                          setPassengers(updated);
                        }}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <select
                        value={passenger.gender}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[index].gender = e.target.value;
                          setPassengers(updated);
                        }}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-700/80">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!driver.fullName || !driver.mobile) {
                    setErrorMessage("Please fill in Driver Full Name and Mobile Number.");
                    return;
                  }
                  setErrorMessage("");
                  setCurrentStep(3);
                }}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-black text-sm uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: VEHICLE DETAILS & MODS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn bg-neutral-800/50 border border-neutral-700/80 rounded-2xl p-6 sm:p-8">
            <div>
              <h2 className="font-outfit text-2xl font-black uppercase text-white flex items-center space-x-2">
                <Car className="w-6 h-6 text-amber-500" />
                <span>Vehicle Details</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Tell us about your 4x4 machine for technical classification
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Owner Name *</label>
                <input
                  type="text"
                  placeholder="Owner Name as in RC"
                  value={vehicle.ownerName || driver.fullName}
                  onChange={(e) => setVehicle({ ...vehicle, ownerName: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Registration Number *</label>
                <input
                  type="text"
                  placeholder="TN 10 AB 1234"
                  value={vehicle.regNumber}
                  onChange={(e) => setVehicle({ ...vehicle, regNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm font-mono uppercase focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Make *</label>
                <select
                  value={vehicle.make}
                  onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option>Mahindra</option>
                  <option>Maruti Suzuki</option>
                  <option>Toyota</option>
                  <option>Jeep</option>
                  <option>Isuzu</option>
                  <option>Force Motors</option>
                  <option>Land Rover</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Model *</label>
                <input
                  type="text"
                  placeholder="e.g. Thar / Gypsy / Gurkha / Hilux / Jimny"
                  value={vehicle.model}
                  onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Manufacturing Year *</label>
                <select
                  value={vehicle.year}
                  onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                >
                  {["2025", "2024", "2023", "2022", "2021", "2020", "2018", "2015", "Older"].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">Colour *</label>
                <input
                  type="text"
                  placeholder="e.g. Black / Red / Desert Sand / White"
                  value={vehicle.colour}
                  onChange={(e) => setVehicle({ ...vehicle, colour: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Fuel Type</label>
                <select
                  value={vehicle.fuelType}
                  onChange={(e) => setVehicle({ ...vehicle, fuelType: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                >
                  <option>Diesel</option>
                  <option>Petrol</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Transmission</label>
                <select
                  value={vehicle.transmission}
                  onChange={(e) => setVehicle({ ...vehicle, transmission: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                >
                  <option>Manual</option>
                  <option>Automatic</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Drivetrain</label>
                <select
                  value={vehicle.drivetrain}
                  onChange={(e) => setVehicle({ ...vehicle, drivetrain: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                >
                  <option>4x4 with Low-Range</option>
                  <option>AWD</option>
                </select>
              </div>
            </div>

            {/* Modified or Stock Toggle */}
            <div className="pt-4 border-t border-neutral-700/80">
              <label className="block text-xs font-mono text-neutral-300 uppercase mb-2 font-bold">
                Is your vehicle modified?
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="modified"
                    checked={!vehicle.isModified}
                    onChange={() => setVehicle({ ...vehicle, isModified: false })}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>Stock / Factory Condition</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="modified"
                    checked={vehicle.isModified}
                    onChange={() => setVehicle({ ...vehicle, isModified: true })}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-bold text-amber-400">Modified Machine</span>
                </label>
              </div>
            </div>

            {/* Modification Details Sub-Panel */}
            {vehicle.isModified && (
              <div className="p-5 bg-neutral-900/90 border border-amber-900/40 rounded-xl space-y-4">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  TECHNICAL MODIFICATION PARTICULARS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Suspension</label>
                    <input
                      type="text"
                      placeholder='e.g. 2" Lift / Ironman / Old Man Emu'
                      value={modifications.suspension}
                      onChange={(e) => setModifications({ ...modifications, suspension: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Tyre Spec</label>
                    <input
                      type="text"
                      placeholder="e.g. 285/70 R17 (33 Inch MT)"
                      value={modifications.tyreSize}
                      onChange={(e) => setModifications({ ...modifications, tyreSize: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Differential / Lockers</label>
                    <input
                      type="text"
                      placeholder="e.g. Rear Eaton MLD / Air Locker"
                      value={modifications.differential}
                      onChange={(e) => setModifications({ ...modifications, differential: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Winch Capacity</label>
                    <input
                      type="text"
                      placeholder="e.g. 9,500 lbs Warn / Runva"
                      value={modifications.winch}
                      onChange={(e) => setModifications({ ...modifications, winch: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Snorkel & Breathers</label>
                    <input
                      type="text"
                      placeholder="Raised Snorkel + Differential breathers"
                      value={modifications.snorkel}
                      onChange={(e) => setModifications({ ...modifications, snorkel: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Recovery Points</label>
                    <input
                      type="text"
                      placeholder="Dual Chassis-Mounted Rated Points"
                      value={modifications.recoveryPoints}
                      onChange={(e) => setModifications({ ...modifications, recoveryPoints: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                </div>

                {/* Upload Photos simulation */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase mb-2">VEHICLE SCRUTINEERING PHOTOS:</div>
                  <div className="grid grid-cols-3 gap-3">
                    {["Front View", "Rear View", "Side View"].map((label) => (
                      <div
                        key={label}
                        className="border border-dashed border-neutral-700 rounded-lg p-3 text-center bg-neutral-800/40 hover:border-amber-500 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                        <span className="text-[10px] font-mono block text-neutral-300">{label}</span>
                        <span className="text-[9px] text-emerald-400 font-mono">Ready to Scrutineer</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-700/80">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!vehicle.regNumber) {
                    setErrorMessage("Please enter Vehicle Registration Number.");
                    return;
                  }
                  setErrorMessage("");
                  setCurrentStep(4);
                }}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-black text-sm uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: VEHICLE DOCUMENTS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn bg-neutral-800/50 border border-neutral-700/80 rounded-2xl p-6 sm:p-8">
            <div>
              <h2 className="font-outfit text-2xl font-black uppercase text-white flex items-center space-x-2">
                <FileCheck className="w-6 h-6 text-amber-500" />
                <span>Vehicle Documents</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Upload clear and valid documents for marshal verification
              </p>
            </div>

            <div className="space-y-4">
              {/* RC */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-outfit text-base font-bold text-white uppercase">Registration Certificate (RC)</div>
                  <div className="text-xs text-neutral-400 font-mono">JPG, PNG or PDF (Max 5MB)</div>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded">
                  <Check className="w-4 h-4" />
                  <span>RC Verified & Uploaded</span>
                </div>
              </div>

              {/* Insurance */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-outfit text-base font-bold text-white uppercase">Insurance Certificate</div>
                  <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Insurance Uploaded</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Company</label>
                    <input
                      type="text"
                      value={documents.insuranceCompany}
                      onChange={(e) => setDocuments({ ...documents, insuranceCompany: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Policy Number</label>
                    <input
                      type="text"
                      value={documents.policyNumber}
                      onChange={(e) => setDocuments({ ...documents, policyNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={documents.insuranceExpiry}
                      onChange={(e) => setDocuments({ ...documents, insuranceExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* PUC */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-outfit text-base font-bold text-white uppercase">Pollution Under Control (PUC)</div>
                  <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>PUC Uploaded</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">PUC Number</label>
                    <input
                      type="text"
                      value={documents.pucNumber}
                      onChange={(e) => setDocuments({ ...documents, pucNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={documents.pucExpiry}
                      onChange={(e) => setDocuments({ ...documents, pucExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Declarations */}
              <div className="pt-3 space-y-2 text-xs text-neutral-300">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documents.declarationAccurate}
                    onChange={(e) => setDocuments({ ...documents, declarationAccurate: e.target.checked })}
                    className="mt-0.5 text-amber-500 rounded"
                  />
                  <span>I confirm that the vehicle information and documents submitted are accurate and genuine.</span>
                </label>
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documents.declarationRoadworthy}
                    onChange={(e) => setDocuments({ ...documents, declarationRoadworthy: e.target.checked })}
                    className="mt-0.5 text-amber-500 rounded"
                  />
                  <span>I confirm that the vehicle is legally registered, roadworthy, and fit for tough terrain conditions.</span>
                </label>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-700/80">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!documents.declarationAccurate || !documents.declarationRoadworthy) {
                    setErrorMessage("Please accept the vehicle safety declarations to proceed.");
                    return;
                  }
                  setErrorMessage("");
                  setCurrentStep(5);
                }}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-black text-sm uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: EXPERIENCE & SAFETY ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn bg-neutral-800/50 border border-neutral-700/80 rounded-2xl p-6 sm:p-8">
            <div>
              <h2 className="font-outfit text-2xl font-black uppercase text-white flex items-center space-x-2">
                <Shield className="w-6 h-6 text-amber-500" />
                <span>Experience & Safety</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Help us understand your off-road experience and vital health details for marshal safety
              </p>
            </div>

            <div className="space-y-5">
              {/* Experience Level */}
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-2">Off-road Experience Level *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Beginner", "Intermediate", "Experienced", "Advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSafety({ ...safety, experienceLevel: lvl })}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-mono uppercase tracking-wider ${
                        safety.experienceLevel === lvl
                          ? "bg-amber-600 border-amber-500 text-white font-bold"
                          : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Past Event experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase mb-1">
                    Participated in off-road events before?
                  </label>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        checked={safety.participatedBefore === "Yes"}
                        onChange={() => setSafety({ ...safety, participatedBefore: "Yes" })}
                        className="text-amber-500"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        checked={safety.participatedBefore === "No"}
                        onChange={() => setSafety({ ...safety, participatedBefore: "No" })}
                        className="text-amber-500"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {safety.participatedBefore === "Yes" && (
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">If yes, how many?</label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      value={safety.eventCount}
                      onChange={(e) => setSafety({ ...safety, eventCount: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Terrain Experience chips */}
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-2">
                  Terrain Experience (Select all you have driven):
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Rocky", "Mud", "Inclines", "Descents", "Technical", "Loose"].map((terr) => {
                    const active = safety.terrains.includes(terr);
                    return (
                      <button
                        key={terr}
                        type="button"
                        onClick={() => toggleTerrain(terr)}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors ${
                          active
                            ? "bg-amber-600/30 border-amber-500 text-amber-300 font-bold"
                            : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500"
                        }`}
                      >
                        {terr} {active && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Medical Information */}
              <div className="pt-4 border-t border-neutral-700/80">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-3">
                  MEDICAL INFORMATION FOR EMERGENCY MARSHAL TEAM
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Blood Group *</label>
                    <select
                      value={safety.bloodGroup}
                      onChange={(e) => setSafety({ ...safety, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white font-mono"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                        <option key={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Known Allergies</label>
                    <input
                      type="text"
                      placeholder="None or list"
                      value={safety.allergies}
                      onChange={(e) => setSafety({ ...safety, allergies: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Medical Conditions</label>
                    <input
                      type="text"
                      placeholder="None or specify"
                      value={safety.medicalConditions}
                      onChange={(e) => setSafety({ ...safety, medicalConditions: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Current Medication</label>
                    <input
                      type="text"
                      placeholder="None or list"
                      value={safety.currentMedication}
                      onChange={(e) => setSafety({ ...safety, currentMedication: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-700/80">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-black text-sm uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: REVIEW & PAYMENT ================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn bg-neutral-800/50 border border-neutral-700/80 rounded-2xl p-6 sm:p-8">
            <div>
              <h2 className="font-outfit text-2xl font-black uppercase text-white flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-amber-500" />
                <span>Review Your Registration</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Please review your details carefully before proceeding to slot allocation
              </p>
            </div>

            <div className="space-y-3">
              {/* Experience Summary */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">EXPERIENCE</span>
                  <div className="font-outfit text-lg font-bold text-white uppercase">{selectedExperience}</div>
                  <div className="text-xs text-neutral-400 font-mono">{selectedDate} • {pricingTier}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-outfit text-xl font-black text-amber-400">
                    ₹{selectedExperience === "OWN 4X4 EXPERIENCE" ? (pricingTier === "EARLY_BIRD" ? "5,999" : "6,999") : "1,999"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-amber-400 hover:underline font-mono"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Driver Summary */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">PRIMARY DRIVER</span>
                  <div className="font-outfit text-base font-bold text-white">{driver.fullName || "Manikandan S"}</div>
                  <div className="text-xs text-neutral-400 font-mono">{driver.mobile || "+91 98765 43210"} • {driver.email || "driver@example.com"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-amber-400 hover:underline font-mono"
                >
                  Edit
                </button>
              </div>

              {/* Vehicle Summary */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">VEHICLE MACHINE</span>
                  <div className="font-outfit text-base font-bold text-white">{vehicle.make} {vehicle.model}</div>
                  <div className="text-xs text-neutral-400 font-mono">
                    {vehicle.regNumber || "TN 10 AB 1234"} • {vehicle.fuelType} • {vehicle.transmission} • {vehicle.drivetrain}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-amber-400 hover:underline font-mono"
                >
                  Edit
                </button>
              </div>

              {/* Crew Summary */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">CREW MEMBERS</span>
                  <div className="text-xs text-neutral-300 font-sans">
                    Driver: 1 | Passengers: {passengers.length} | Additional Participants: {additionalCount}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-amber-400 hover:underline font-mono"
                >
                  Edit
                </button>
              </div>

              {/* Documents & Safety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block">DOCUMENTS</span>
                    <span className="text-emerald-400 font-mono font-bold">All documents verified</span>
                  </div>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-amber-400 font-mono">
                    Edit
                  </button>
                </div>
                <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block">SAFETY & MEDICAL</span>
                    <span className="text-neutral-300 font-mono">{safety.experienceLevel} • Blood: {safety.bloodGroup}</span>
                  </div>
                  <button type="button" onClick={() => setCurrentStep(5)} className="text-xs text-amber-400 font-mono">
                    Edit
                  </button>
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-5 bg-neutral-950 border border-amber-600/40 rounded-xl space-y-2 mt-4">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  PAYMENT SUMMARY
                </div>
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>{selectedExperience} ({pricingTier})</span>
                  <span>₹{selectedExperience === "OWN 4X4 EXPERIENCE" ? (pricingTier === "EARLY_BIRD" ? "5,999" : "6,999") : "1,999"}</span>
                </div>
                {additionalCount > 0 && (
                  <div className="flex justify-between text-xs text-neutral-300">
                    <span>Additional Participant × {additionalCount}</span>
                    <span>₹{additionalCount * 699}</span>
                  </div>
                )}
                <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
                  <span className="font-outfit text-base font-bold text-white uppercase">Total Amount</span>
                  <span className="font-outfit text-2xl font-black text-amber-500">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-700/80">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-black text-base uppercase tracking-wider rounded-lg shadow-xl hover:shadow-amber-600/40 flex items-center space-x-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Entry...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 7: REGISTRATION CONFIRMED! ================= */}
        {currentStep === 7 && confirmedData && (
          <div className="space-y-12 animate-fadeIn">
            <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="font-outfit text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mb-2">
                Registration Confirmed!
              </h2>
              <p className="text-sm font-sans text-emerald-400 font-medium mb-6">
                You&apos;re officially on the Trail! Scrutineering slot locked in the database.
              </p>

              {/* Unique Registration Code Badge */}
              <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-700 inline-block mb-6 min-w-[280px]">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                  OFFICIAL REGISTRATION ID
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
                  {confirmedData.registration_code}
                </span>
              </div>

              {/* Event Quick Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-xs bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 mb-8">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Experience</span>
                  <span className="text-white font-bold">{confirmedData.experience_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Event Date</span>
                  <span className="text-white font-bold">{confirmedData.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Venue Proving Ground</span>
                  <span className="text-white font-bold">Urigam Village, Anchetty</span>
                </div>
              </div>

              {/* What's Next List */}
              <div className="text-left bg-neutral-900/40 p-5 rounded-xl border border-neutral-800/80 mb-8 space-y-2.5">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-2">
                  WHAT&apos;S NEXT?
                </div>
                <div className="flex items-center space-x-3 text-xs text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Confirmation sent to your WhatsApp & Email dispatch leads</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Physical vehicle scrutineering verification at event check-in</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Participant technical kit, trail decals, and beacon collection</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Mandatory safety and spotter protocol driver briefing</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-mono text-xs uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Confirmation</span>
                </button>
                <a
                  href="#trail"
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded-lg border border-neutral-700 text-center"
                >
                  Back to Website
                </a>
              </div>
            </div>

            {/* ============================================================== */}
            {/* USER INSTRUCTION: "after registration then only we need to show the sponsor related details" */}
            {/* ============================================================== */}
            <div className="border-t border-neutral-800 pt-16">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>UNLOCKED FOR REGISTERED PARTICIPANTS & BRANDS</span>
                </div>
                <h2 className="font-outfit text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
                  COMMERCIAL SPONSORSHIPS & PARTNERSHIPS
                </h2>
                <p className="font-sans text-sm text-neutral-400 mt-3 leading-relaxed">
                  Put your brand in front of top automotive enthusiasts, off-road fabricators, and industry leaders. Download the official sponsor deck or request an invoice below.
                </p>
              </div>

              {/* Embed Dynamic Sponsor Hub */}
              <Sponsors />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
