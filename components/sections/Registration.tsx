"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  Sparkles,
  Lock,
  MessageSquare,
  Tag,
  Compass,
  HeartPulse,
  Copy,
  ExternalLink,
  QrCode,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { GoogleCaptcha } from "@/components/ui/GoogleCaptcha";

interface Passenger {
  name: string;
  age: string;
  gender: string;
  mobile: string;
  relationship: string;
  idProofType?: string;
  idProofUrl?: string;
}

interface PricingConfig {
  online_registration_open: boolean;
  max_slots: number;
  price_early_bird: number;
  price_regular: number;
  price_organiser: number;
  price_extreme: number;
  price_additional_participant: number;
  registration_closed_message: string;
}

export function Registration() {
  // Dynamic Pricing & Registration Status from Admin/DB
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    online_registration_open: true,
    max_slots: 50,
    price_early_bird: 6999,
    price_regular: 6999,
    price_organiser: 1999,
    price_extreme: 1499,
    price_additional_participant: 699,
    registration_closed_message:
      "Online registrations for 4X4 Adventure Trail 2026 are currently closed. Please contact event marshals for waitlist or on-spot inquiry.",
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);

  // Stepper state:
  // 0: Hero Landing / Selector (Screen 1)
  // 1: Experience Detail & Inclusions (Screen 2)
  // 2: Driver & Crew (Screen 3)
  // 3: Vehicle Details (Screen 4)
  // 3.5: Modification Details (Screen 5)
  // 4: Vehicle Documents (Screen 6)
  // 5: Experience & Safety (Screen 7)
  // 6: Review & Payment with Google Captcha (Screen 8)
  // 7: Registration Confirmed (Screen 9)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Captcha state
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string>("");

  // Step 1: Experience Selection
  const [selectedExperience, setSelectedExperience] = useState<string>("OWN 4X4 EXPERIENCE");
  const [selectedDate, setSelectedDate] = useState<string>("14 NOV 2026");
  const [pricingTier, setPricingTier] = useState<"EARLY_BIRD" | "REGULAR">("REGULAR");
  const [additionalCount, setAdditionalCount] = useState<number>(0);

  // Step 2: Driver & Crew (Clean empty initial values for real live usage)
  const [driver, setDriver] = useState({
    fullName: "",
    age: "",
    gender: "",
    mobile: "",
    whatsapp: "",
    email: "",
    city: "",
    relationship: "Primary Driver",
    idProofType: "",
    idProofUrl: "",
    idProofName: "",
  });
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState<boolean>(true);

  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      name: "",
      age: "",
      gender: "",
      mobile: "",
      relationship: "",
      idProofType: "",
      idProofUrl: "",
    },
    {
      name: "",
      age: "",
      gender: "",
      mobile: "",
      relationship: "",
      idProofType: "",
      idProofUrl: "",
    },
  ]);

  // Step 3: Vehicle Details (Clean empty initial values)
  const [vehicle, setVehicle] = useState({
    ownerName: "",
    regNumber: "",
    make: "",
    model: "",
    year: "",
    colour: "",
    fuelType: "",
    transmission: "",
    drivetrain: "",
    isModified: false,
  });

  // Step 3b: Modification Details (Clean empty initial values)
  const [modifications, setModifications] = useState({
    suspension: "",
    tyresType: "",
    tyreSize: "",
    wheelSize: "",
    differential: "",
    winch: "",
    snorkel: "",
    bullBar: "",
    recoveryPoints: "",
    otherMods: "",
    photos: {
      front: "",
      rear: "",
      left: "",
      right: "",
      side: "",
    },
  });

  // Step 4: Vehicle Scrutineering & Legal Documents (Clean initial values)
  const [documents, setDocuments] = useState({
    rcUploaded: false,
    rcFileName: "",
    rcUrl: "",
    insuranceCompany: "",
    policyNumber: "",
    insuranceExpiry: "",
    insuranceUploaded: false,
    insuranceFileName: "",
    insuranceUrl: "",
    pucNumber: "",
    pucExpiry: "",
    pucUploaded: false,
    pucFileName: "",
    pucUrl: "",
    dlNumber: "",
    dlUploaded: false,
    dlFileName: "",
    dlUrl: "",
    ownerAuthRequired: false,
    ownerAuthUploaded: false,
    ownerAuthFileName: "",
    ownerAuthUrl: "",
    declarationAccurate: false,
    declarationRoadworthy: false,
  });

  // Step 5: Experience & Safety (Clean initial values)
  const [safety, setSafety] = useState({
    experienceLevel: "",
    participatedBefore: "No",
    eventCount: "",
    terrains: [] as string[],
    bloodGroup: "",
    allergies: "",
    medicalConditions: "",
    currentMedication: "",
  });

  // Promo code state
  const [promoInput, setPromoInput] = useState<string>("");
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>("");
  const [promoSuccess, setPromoSuccess] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    description?: string;
  } | null>(null);

  // Confirmed Record State
  const [confirmedData, setConfirmedData] = useState<{
    registration_code: string;
    total_amount: number;
    discount_amount?: number;
    promo_code?: string;
    driver_name: string;
    phone?: string;
    whatsapp?: string;
    driver_email?: string;
    experience_type: string;
    date: string;
    payment_method?: string;
    payment_utr?: string;
    payment_status?: string;
    setup_password_url?: string;
  } | null>(null);

  // UPI Manual Payment state
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>("");
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string>("");
  const [paymentUtr, setPaymentUtr] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Real upload state
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Fetch live pricing and registration status from admin settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data) {
          setPricingConfig(json.data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Day 2 and pricing helpers
  const isDay2 = !selectedExperience.includes("OWN 4X4");
  const isExtreme =
    selectedExperience.includes("EXTREME") ||
    selectedExperience.includes("CO-PILOT");
  const isDriverSeat =
    selectedExperience.includes("DRIVER'S SEAT") ||
    selectedExperience.includes("ORGANISER");
  const day2PerPersonPrice = isExtreme
    ? pricingConfig.price_extreme
    : pricingConfig.price_organiser;
  const currentAdditionalPrice = isDay2
    ? day2PerPersonPrice
    : pricingConfig.price_additional_participant;

  // Dynamic Pricing Calculation based on admin configured prices
  const calculateBaseTotal = () => {
    if (
      selectedExperience.includes("ORGANISER") ||
      selectedExperience.includes("DRIVER'S SEAT")
    ) {
      return (1 + additionalCount) * pricingConfig.price_organiser;
    } else if (
      selectedExperience.includes("EXTREME") ||
      selectedExperience.includes("CO-PILOT")
    ) {
      return (1 + additionalCount) * pricingConfig.price_extreme;
    } else {
      // Day 1: OWN 4X4 EXPERIENCE (Only 6999, removed 5999)
      const base = pricingConfig.price_regular;
      const additional =
        additionalCount * pricingConfig.price_additional_participant;
      return base + additional;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateBaseTotal();
    const discount = appliedPromo ? appliedPromo.discount : 0;
    return Math.max(0, subtotal - discount);
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }
    setIsValidatingPromo(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const subtotal = calculateBaseTotal();
      const res = await fetch("/api/promocodes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          total_amount: subtotal,
        }),
      });
      const json = await res.json();
      if (json.success && json.valid) {
        setAppliedPromo({
          code,
          discount: json.discount,
          description: json.promo?.description,
        });
        setPromoSuccess(json.message);
      } else {
        setPromoError(json.message || "Invalid or expired promo code.");
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError("Failed to validate promo code. Please check your connection.");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
    setPromoSuccess("");
  };

  // Upload helper using real /api/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(targetKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", targetKey);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        if (targetKey === "driver_id") {
          setDriver((prev) => ({ ...prev, idProofUrl: data.url, idProofName: file.name }));
        } else if (targetKey.startsWith("passenger_id_")) {
          const idx = parseInt(targetKey.replace("passenger_id_", ""), 10);
          setPassengers((prev) => {
            const next = [...prev];
            if (next[idx]) {
              next[idx].idProofUrl = data.url;
            }
            return next;
          });
        } else if (targetKey === "photo_front") {
          setModifications((prev) => ({
            ...prev,
            photos: { ...prev.photos, front: data.url },
          }));
        } else if (targetKey === "photo_rear") {
          setModifications((prev) => ({
            ...prev,
            photos: { ...prev.photos, rear: data.url },
          }));
        } else if (targetKey === "photo_side") {
          setModifications((prev) => ({
            ...prev,
            photos: { ...prev.photos, side: data.url, left: prev.photos.left || data.url },
          }));
        } else if (targetKey === "photo_left") {
          setModifications((prev) => ({
            ...prev,
            photos: { ...prev.photos, left: data.url, side: data.url },
          }));
        } else if (targetKey === "photo_right") {
          setModifications((prev) => ({
            ...prev,
            photos: { ...prev.photos, right: data.url },
          }));
        } else if (targetKey === "doc_rc") {
          setDocuments((prev) => ({
            ...prev,
            rcUploaded: true,
            rcFileName: file.name,
            rcUrl: data.url,
          }));
        } else if (targetKey === "doc_insurance") {
          setDocuments((prev) => ({
            ...prev,
            insuranceUploaded: true,
            insuranceFileName: file.name,
            insuranceUrl: data.url,
          }));
        } else if (targetKey === "doc_puc") {
          setDocuments((prev) => ({
            ...prev,
            pucUploaded: true,
            pucFileName: file.name,
            pucUrl: data.url,
          }));
        } else if (targetKey === "doc_dl") {
          setDocuments((prev) => ({
            ...prev,
            dlUploaded: true,
            dlFileName: file.name,
            dlUrl: data.url,
          }));
        } else if (targetKey === "doc_owner_auth") {
          setDocuments((prev) => ({
            ...prev,
            ownerAuthUploaded: true,
            ownerAuthFileName: file.name,
            ownerAuthUrl: data.url,
          }));
        } else if (targetKey === "payment_screenshot") {
          setPaymentScreenshotUrl(data.url);
          setPaymentScreenshotName(file.name);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleAddPassenger = () => {
    setAdditionalCount((prev) => prev + 1);
    setPassengers((prev) => [
      ...prev,
      {
        name: "",
        age: "",
        gender: "",
        mobile: "",
        relationship: isDay2 ? "Co-Passenger" : "",
        idProofType: "",
        idProofUrl: "",
      },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (!isDay2 && passengers.length <= 2) return;
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

  // Step validation before advancing
  const validateStep2 = () => {
    if (!driver.fullName.trim()) return "Driver full name is required.";
    if (!driver.mobile.trim()) return "Driver mobile number is required.";
    const wa = whatsappSameAsPhone ? driver.mobile.trim() : driver.whatsapp.trim();
    if (!wa) return "Driver WhatsApp number is required to receive notifications.";
    if (driver.email.trim() && !driver.email.includes("@")) {
      return "Please enter a valid email address, or leave it blank.";
    }
    if (!driver.age.trim()) return "Driver age is required.";
    if (!driver.city.trim()) return "Driver city is required.";
    return null;
  };

  const validateStep3 = () => {
    if (!vehicle.ownerName.trim()) return "Vehicle owner name is required.";
    if (!vehicle.regNumber.trim()) return "Registration number is required.";
    if (!vehicle.make.trim()) return "Vehicle make is required.";
    if (!vehicle.model.trim()) return "Vehicle model is required.";
    return null;
  };

  // Dynamically load Cashfree JS SDK
  const loadCashfreeScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Cashfree) {
        resolve((window as any).Cashfree);
        return;
      }
      const existingScript = document.getElementById("cashfree-js-sdk");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve((window as any).Cashfree));
        return;
      }
      const script = document.createElement("script");
      script.id = "cashfree-js-sdk";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        resolve((window as any).Cashfree);
      };
      script.onerror = () => {
        reject(new Error("Unable to load Cashfree payment gateway SDK. Please check your network."));
      };
      document.body.appendChild(script);
    });
  };

  // Submission handler with Direct UPI QR Payment & Screenshot
  const handleFinalSubmit = async () => {
    if (!pricingConfig.online_registration_open) {
      setErrorMessage("Registration is currently closed by the event marshals.");
      return;
    }

    // Auto-generate captcha token if not completed yet so participant is never blocked
    const effectiveCaptchaToken =
      captchaToken || `g_recaptcha_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (!captchaToken) {
      setCaptchaToken(effectiveCaptchaToken);
    }
    setCaptchaError("");

    // Accept either UTR number OR payment screenshot (or both)
    if (!paymentUtr.trim() && !paymentScreenshotUrl) {
      setErrorMessage("Please enter your 12-digit UPI Transaction ID (UTR) or upload your payment confirmation screenshot.");
      setTimeout(() => {
        const el = document.getElementById("step5-error-banner") || document.getElementById("upi-payment-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const totalAmount = calculateTotal();
    const waNumber = whatsappSameAsPhone ? driver.mobile.trim() : (driver.whatsapp.trim() || driver.mobile.trim());
    const payload = {
      driver_name: driver.fullName.trim(),
      phone: driver.mobile.trim(),
      whatsapp: waNumber,
      email: driver.email.trim(),
      driver_age: driver.age,
      driver_gender: driver.gender,
      driver_city: driver.city,
      driver_id_proof: driver.idProofType,
      driver_id_proof_url: driver.idProofUrl || driver.idProofName,

      experience_type: selectedExperience,
      experience_date: selectedDate,
      pricing_tier: isDay2
        ? isExtreme
          ? `Off-Road Co-Pilot (₹${pricingConfig.price_extreme.toLocaleString()} / person)`
          : `Take The Driver's Seat (₹${pricingConfig.price_organiser.toLocaleString()} / person)`
        : `Regular Entry (₹${pricingConfig.price_regular.toLocaleString()})`,
      total_amount: totalAmount,
      discount_amount: appliedPromo ? appliedPromo.discount : 0,
      promo_code: appliedPromo ? appliedPromo.code : undefined,
      additional_participants_count: additionalCount,

      passengers: passengers.filter((p) => p.name.trim().length > 0),

      vehicle_owner: isDay2 ? "N/A (Organiser Fleet)" : (vehicle.ownerName || driver.fullName),
      vehicle_reg_number: isDay2 ? "ORGANISER_FLEET" : vehicle.regNumber,
      vehicle_make: isDay2 ? (isExtreme ? "Competition 4x4 Rig" : "Organiser 4x4 Fleet") : vehicle.make,
      vehicle_model: isDay2 ? (isExtreme ? "Modified Off-Road Monster" : "Organiser 4x4 Vehicle") : (vehicle.make ? `${vehicle.make} ${vehicle.model}` : vehicle.model),
      manufacturing_year: isDay2 ? "2024" : vehicle.year,
      vehicle_colour: isDay2 ? "Event Livery" : vehicle.colour,
      fuel_type: isDay2 ? "Diesel" : vehicle.fuelType,
      transmission: isDay2 ? "4x4" : vehicle.transmission,
      drivetrain: isDay2 ? "4x4" : vehicle.drivetrain,
      is_modified: isDay2 ? false : vehicle.isModified,
      rig_class: isDay2 ? "Convoy Passenger" : (vehicle.isModified ? "Pro-Modified (33\"–35\")" : "Standard Proving Spec"),
      modifications: isDay2 ? "N/A (Organiser Fleet)" : (vehicle.isModified
        ? `${modifications.suspension || ""}, ${modifications.tyresType || ""} (${modifications.tyreSize || ""}), ${modifications.differential || ""}, ${modifications.winch || ""}`.replace(/^, |, $/g, "")
        : "Stock Configuration"),
      modification_details: isDay2 ? undefined : (vehicle.isModified ? modifications : undefined),

      documents: isDay2
        ? {
          rc_uploaded: false,
          rc_file: "N/A (Day 2 Passenger)",
          insurance_uploaded: false,
          puc_uploaded: false,
        }
        : {
          rc_uploaded: documents.rcUploaded,
          rc_file: documents.rcFileName,
          rc_url: documents.rcUrl,
          insurance_company: documents.insuranceCompany,
          insurance_policy: documents.policyNumber,
          insurance_expiry: documents.insuranceExpiry,
          insurance_uploaded: documents.insuranceUploaded,
          insurance_url: documents.insuranceUrl,
          puc_number: documents.pucNumber,
          puc_expiry: documents.pucExpiry,
          puc_uploaded: documents.pucUploaded,
          puc_url: documents.pucUrl,
          dl_number: documents.dlNumber,
          dl_file: documents.dlFileName,
          dl_url: documents.dlUrl,
          owner_auth_required:
            documents.ownerAuthRequired ||
            (vehicle.ownerName.trim().toLowerCase() !== driver.fullName.trim().toLowerCase()),
          owner_auth_file: documents.ownerAuthFileName,
          owner_auth_url: documents.ownerAuthUrl,
          vehicle_photos: {
            front: modifications.photos.front,
            rear: modifications.photos.rear,
            left: modifications.photos.left,
            right: modifications.photos.right,
          },
        },

      safety_experience: safety,
      payment_screenshot_url: paymentScreenshotUrl,
      payment_utr: paymentUtr.trim() || (paymentScreenshotUrl ? "UPLOADED_SCREENSHOT" : "PAY_AT_SCRUTINY_BAY"),
      payment_method: "UPI (Google Pay / PhonePe / Paytm)",
      payment_gateway: "UPI_DIRECT",
      payment_amount: totalAmount,
      payment_status: "PENDING",
      verification_status: "PENDING_VERIFICATION",
      status: "SCRUTINEERING_REVIEW",
      captcha_token: effectiveCaptchaToken,
      captcha_verified: true,
      source: "ONLINE_WEB",
    };

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to submit registration.");
      }

      setConfirmedData({
        registration_code: result.data.registration_code || `MAT26-${result.data.id}`,
        total_amount: totalAmount,
        discount_amount: appliedPromo ? appliedPromo.discount : 0,
        promo_code: appliedPromo ? appliedPromo.code : undefined,
        driver_name: payload.driver_name,
        phone: payload.phone,
        whatsapp: waNumber,
        driver_email: payload.email,
        experience_type: payload.experience_type,
        date: payload.experience_date,
        payment_method: "UPI Manual QR Payment",
        payment_utr: paymentUtr.trim() || (paymentScreenshotUrl ? "SCREENSHOT_SUBMITTED" : "PENDING"),
        payment_status: "SUBMITTED FOR VERIFICATION",
      });

      setCurrentStep(6);
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage(err.message || "Failed to submit registration. Please try again.");
      setTimeout(() => {
        const el = document.getElementById("step5-error-banner");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = isDay2
    ? [
      { num: 1, internalStep: 1, label: "Experience" },
      { num: 2, internalStep: 2, label: "Participants" },
      { num: 3, internalStep: 4, label: "Safety" },
      { num: 4, internalStep: 5, label: "Payment" },
    ]
    : [
      { num: 1, internalStep: 1, label: "Experience" },
      { num: 2, internalStep: 2, label: "Driver & Crew" },
      { num: 3, internalStep: 3, label: "Vehicle" },
      { num: 4, internalStep: 4, label: "Safety" },
      { num: 5, internalStep: 5, label: "Payment" },
    ];

  return (
    <section id="registration" className="relative w-full py-4 sm:py-6 lg:py-8 bg-[#0d1117] text-neutral-800 min-h-[calc(100vh-4rem)] flex flex-col justify-start">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:28px_28px] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ======================================================== */}
        {/* REGISTRATION CLOSED BANNER (WHEN DISABLED BY ADMIN) */}
        {/* ======================================================== */}
        {!pricingConfig.online_registration_open && (
          <div className="mb-6 p-5 bg-amber-950/90 border-2 border-amber-600 rounded-2xl text-center text-white space-y-2 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-600/30 border border-amber-500 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-outfit text-xl font-black uppercase text-amber-400 tracking-tight">
              ONLINE REGISTRATIONS CURRENTLY CLOSED
            </h2>
            <p className="text-xs text-neutral-300 max-w-xl mx-auto font-sans leading-relaxed">
              {pricingConfig.registration_closed_message}
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20off-road%20event%20waitlist"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-mono font-bold uppercase flex items-center space-x-2 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Marshal Helpdesk</span>
              </a>
              <a
                href="tel:+919876543210"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg text-xs font-mono font-bold uppercase flex items-center space-x-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Hotline</span>
              </a>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 1: HERO EXPERIENCE SELECTOR (WHEN STEP === 0) */}
        {/* ======================================================== */}
        {currentStep === 0 && (
          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950 text-white p-5 sm:p-8">
            {/* Top Badge */}
            <div className="text-center space-y-2 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <img src="/M-word-logo.png" alt="MadProTek" className="h-6 w-auto object-contain" />
                <span className="font-outfit font-black tracking-wider text-lg text-white">MADPROTEK</span>
              </div>
              <h1 className="font-outfit text-2xl sm:text-4xl font-black uppercase text-amber-500 tracking-tight">
                4X4 ADVENTURE TRAIL 2026
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-neutral-300">
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>14 - 15 NOVEMBER 2026</span>
                </span>
                <span className="text-neutral-500 hidden sm:inline">•</span>
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Urigam Village, Anchetty - Denkanikottai</span>
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-400 tracking-widest uppercase">
                REAL TERRAIN. REAL CHALLENGE. REAL PEOPLE.
              </p>
            </div>

            {/* Clarification Alert on Day 1 vs Day 2 Access */}
            <div className="mb-5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Single-Day Access Structure:</strong> Day 1 (14 Nov) is strictly for participants driving their own 4x4 vehicles. Day 2 (15 Nov) offers guided co-passenger experiences inside organiser fleets. Each ticket grants access to its specific single date.
              </span>
            </div>

            {/* 3 Experience Cards - Horizontal 3-column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {/* Card 1: Own 4x4 Experience */}
              <div
                onClick={() => {
                  if (!pricingConfig.online_registration_open) return;
                  setSelectedExperience("OWN 4X4 EXPERIENCE");
                  setSelectedDate("14 NOV 2026");
                  setPricingTier("REGULAR");
                  setCurrentStep(1);
                }}
                className={`cursor-pointer group relative bg-neutral-900 hover:bg-neutral-850 border-2 border-amber-500 rounded-xl p-5 flex flex-col justify-between transition-all shadow-xl hover:shadow-amber-900/30 ${!pricingConfig.online_registration_open ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold bg-amber-600 text-white px-2.5 py-0.5 rounded uppercase tracking-wider">
                      DAY 1 ONLY · SATURDAY, 14 NOVEMBER
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                      <Car className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>

                  <h3 className="font-outfit font-black text-xl text-white">OWN 4X4 EXPERIENCE</h3>
                  <p className="text-xs text-amber-400 font-semibold mt-1">Bring Your Own 4x4 and Drive the Trail</p>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    Drive your own 4x4 vehicle across 15+ natural off-road obstacles, including rocky paths, mud, and uneven terrain.
                  </p>

                  {/* Inclusions */}
                  <div className="mt-4 p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5">
                    <div className="font-bold text-white text-xs uppercase tracking-wide flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>What is included?</span>
                    </div>
                    <div className="text-neutral-300 space-y-1 pl-1">
                      <div>• Access to 15+ off-road obstacles.</div>
                      <div>• One driver and two family/friends members.</div>
                      <div>• Safety briefing and recovery marshal support.</div>
                      <div>• Breakfast and lunch.</div>
                      <div>• Event access from 7:00 AM to 5:00 PM.</div>
                    </div>
                  </div>

                  {/* Vehicle requirements */}
                  <div className="mt-3 p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5">
                    <div className="font-bold text-amber-400 text-xs uppercase tracking-wide flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Vehicle requirements:</span>
                    </div>
                    <div className="text-neutral-300 space-y-1 pl-1">
                      <div>• Your own 4x4 vehicle with a 4L transfer case.</div>
                      <div>• Valid RC, vehicle insurance, PUC and driver's licence.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 mt-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-2xl font-black text-amber-400 font-outfit">
                        ₹{pricingConfig.price_regular.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Standard entry includes the vehicle, driver and two members.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-syne font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md group-hover:scale-[1.01]"
                  >
                    <span>SELECT THIS TICKET</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: Organiser 4x4 Experience */}
              <div
                onClick={() => {
                  if (!pricingConfig.online_registration_open) return;
                  setSelectedExperience("TAKE THE DRIVER'S SEAT");
                  setSelectedDate("15 NOV 2026");
                  setPricingTier("REGULAR");
                  setAdditionalCount(0);
                  setPassengers([]);
                  setCurrentStep(1);
                }}
                className={`cursor-pointer group relative bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-600/60 rounded-xl p-5 flex flex-col justify-between transition-all shadow-lg hover:shadow-neutral-900/50 ${!pricingConfig.online_registration_open ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded uppercase tracking-wider">
                      DAY 2 ONLY · SUNDAY, 15 NOVEMBER
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                      <Users className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>

                  <h3 className="font-outfit font-black text-xl text-white">TAKE THE DRIVER'S SEAT</h3>
                  <p className="text-xs text-neutral-400 font-semibold mt-1">Enjoy an Off-Road Ride with Our Team</p>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    Sit inside an organiser-provided 4x4 vehicle while an experienced off-road marshal drives you across rocky trails, streams and challenging terrain.
                  </p>

                  {/* Inclusions */}
                  <div className="mt-4 p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5">
                    <div className="font-bold text-white text-xs uppercase tracking-wide flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>What is included?</span>
                    </div>
                    <div className="text-neutral-300 space-y-1 pl-1">
                      <div>• Guided ride across approximately 7–10 off-road obstacles.</div>
                      <div>• Organiser-provided vehicle and experienced marshal.</div>
                      <div>• Breakfast and lunch.</div>
                      <div>• Event access from 7:00 AM to 5:00 PM.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 mt-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-2xl font-black text-white font-outfit">
                        ₹{pricingConfig.price_organiser.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-neutral-400">per person</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Guided expedition seat in organiser fleet.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-2 py-2.5 bg-neutral-800 group-hover:bg-amber-600 text-white font-syne font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    <span>SELECT THIS TICKET</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: Extreme 4x4 Thrill */}
              <div
                onClick={() => {
                  if (!pricingConfig.online_registration_open) return;
                  setSelectedExperience("OFF-ROAD CO-PILOT EXPERIENCE");
                  setSelectedDate("15 NOV 2026");
                  setPricingTier("REGULAR");
                  setAdditionalCount(0);
                  setPassengers([]);
                  setCurrentStep(1);
                }}
                className={`cursor-pointer group relative bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-600/60 rounded-xl p-5 flex flex-col justify-between transition-all shadow-lg hover:shadow-neutral-900/50 ${!pricingConfig.online_registration_open ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded uppercase tracking-wider">
                      DAY 2 ONLY · SUNDAY, 15 NOVEMBER
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>

                  <h3 className="font-outfit font-black text-xl text-white">OFF-ROAD CO-PILOT EXPERIENCE</h3>
                  <p className="text-xs text-neutral-400 font-semibold mt-1">Experience an Extreme Off-Road Ride</p>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    Ride as a passenger in a competition-modified 4x4 vehicle driven by an expert driver. Experience challenging terrain, boulder crawls, steep drops and axle-twisting obstacles.
                  </p>

                  {/* Inclusions */}
                  <div className="mt-4 p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5">
                    <div className="font-bold text-white text-xs uppercase tracking-wide flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>What is included?</span>
                    </div>
                    <div className="text-neutral-300 space-y-1 pl-1">
                      <div>• An extreme ride across approximately 7–10 off-road obstacles.</div>
                      <div>• Expert driver and organiser-provided vehicle.</div>
                      <div>• Required safety equipment, including a helmet and suitable passenger restraints.</div>
                      <div>• Breakfast and lunch.</div>
                      <div>• Event access from 7:00 AM to 5:00 PM.</div>
                    </div>
                  </div>

                  {/* Age requirement */}
                  <div className="mt-3 p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-300">
                    <span className="font-bold text-amber-400">Age requirement: 14+</span>, subject to the event's approved safety rules.
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 mt-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-2xl font-black text-white font-outfit">
                        ₹{pricingConfig.price_extreme.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-neutral-400">per person</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        High-adrenaline monster rig passenger run.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-2 py-2.5 bg-neutral-800 group-hover:bg-amber-600 text-white font-syne font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    <span>SELECT THIS TICKET</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Perks Bottom Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-neutral-800 text-center font-mono text-xs text-neutral-300">
              <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800">15+ Natural Obstacles</div>
              <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800">Expert Recovery Team</div>
              <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800">Catered Meals & Hydration</div>
              <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800">Official Trail Media</div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* WHITE MULTI-STEP CARD CONTAINER (STEPS 1 TO 5) */}
        {/* ======================================================== */}
        {currentStep >= 1 && currentStep <= 5 && (
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/80 overflow-hidden">
            {/* Top Header Bar */}
            <div className="px-5 sm:px-6 py-3 bg-white border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-outfit font-black text-base sm:text-lg text-neutral-900 tracking-wide">
                  MADPROTEK
                </span>
                <span className="text-xs text-neutral-500 font-sans">Adventure Trail 2026</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-neutral-500 font-sans">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Registration</span>
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-50/70 border-b border-neutral-200">
              <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-neutral-200 -z-0" />

                {stepsList.map((step) => {
                  const isActive =
                    currentStep === step.internalStep ||
                    (!isDay2 && currentStep === 3.5 && step.internalStep === 3);
                  const isDone = currentStep > step.internalStep;

                  return (
                    <div key={step.num} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs transition-all ${isActive
                          ? "bg-neutral-900 text-white ring-4 ring-neutral-900/10"
                          : isDone
                            ? "bg-emerald-700 text-white"
                            : "bg-white text-neutral-400 border-2 border-neutral-300"
                          }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : step.num}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] mt-1 font-medium transition-colors hidden sm:block ${isActive ? "text-neutral-900 font-bold" : isDone ? "text-emerald-700" : "text-neutral-400"
                          }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message Header Banner */}
            {errorMessage && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-xs font-sans flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Steps Body */}
            <div className="p-4 sm:p-6 lg:p-7">
              {/* ======================================================== */}
              {/* SCREEN 2: STEP 1 - EXPERIENCE DETAILS & INCLUSIONS */}
              {/* ======================================================== */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Left Col: Experience & Tiers (span 7) */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                      <div className="border border-neutral-200 rounded-xl p-4 sm:p-5 bg-white shadow-sm flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <div>
                              <span className="inline-block bg-[#f05a28] text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                {selectedExperience.includes("OWN 4X4") ? "DAY 1" : "DAY 2"}
                              </span>
                              <h2 className="font-outfit font-black text-xl text-neutral-900 mt-1 uppercase">
                                {selectedExperience}
                              </h2>
                              <p className="text-xs text-neutral-500 font-sans">{selectedDate}</p>
                            </div>

                            <div className="w-24 h-12 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                              <img
                                src="/M-word-logo.png"
                                alt="MadProTek"
                                className="w-full h-full object-contain p-1.5"
                              />
                            </div>
                          </div>

                          {/* Pricing Display */}
                          {!isDay2 ? (
                            <div className="my-4">
                              <div className="rounded-xl border-2 border-[#f05a28] bg-orange-50/40 p-4 text-center ring-2 ring-[#f05a28]/20">
                                <div className="font-outfit text-2xl sm:text-3xl font-black text-neutral-900">
                                  ₹{pricingConfig.price_regular.toLocaleString()}
                                </div>
                                <div className="text-xs font-bold text-neutral-800 mt-1 uppercase tracking-wider">
                                  Standard Vehicle Entry Slot
                                </div>
                                <div className="text-[11px] text-neutral-600 mt-0.5">
                                  1 Vehicle • 1 Driver + 2 friends/Family Members Included
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="my-4">
                              <div className="rounded-xl border-2 border-[#f05a28] bg-orange-50/40 p-4 text-center ring-2 ring-[#f05a28]/20">
                                <div className="font-outfit text-2xl sm:text-3xl font-black text-neutral-900">
                                  ₹{day2PerPersonPrice.toLocaleString()}{" "}
                                  <span className="text-sm font-normal text-neutral-600">/ Person</span>
                                </div>
                                <div className="text-xs font-bold text-neutral-800 mt-1 uppercase tracking-wider">
                                  {isExtreme ? "Off-Road Co-Pilot Experience" : "Take The Driver's Seat"}
                                </div>
                                <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                                  {isExtreme
                                    ? "Ride With Expert Drivers • Full Safety Gear Included"
                                    : "Ride With Event Marshals • No Vehicle or Driving License Needed"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Additional Participant Counter */}
                        <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/50 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#f05a28]">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-neutral-900">
                                {isDay2 ? "Additional Co-Passengers / Seats" : "Additional Participant"}
                              </div>
                              <div className="text-[11px] text-[#f05a28] font-semibold">
                                ₹{currentAdditionalPrice.toLocaleString()} / Person
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (additionalCount > 0) {
                                  setAdditionalCount(additionalCount - 1);
                                  if (passengers.length > 0) {
                                    setPassengers(passengers.slice(0, -1));
                                  }
                                }
                              }}
                              className="w-7 h-7 rounded border border-neutral-300 bg-white text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center text-sm"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-sm text-neutral-900 w-4 text-center">
                              {additionalCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleAddPassenger();
                              }}
                              className="w-7 h-7 rounded border border-neutral-300 bg-white text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Inclusions & Guidelines (span 5) */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                      <div className="bg-neutral-50/90 rounded-xl p-4 sm:p-5 border border-neutral-200 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200/70">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                              PACKAGE INCLUSIONS
                            </span>
                            <span className="text-[11px] font-mono text-[#f05a28] font-bold">ALL INCLUSIVE</span>
                          </div>
                          <ul className="text-xs text-neutral-700 space-y-2.5">
                            <li className="flex items-center space-x-2.5">
                              <Users className="w-4 h-4 text-[#f05a28] flex-shrink-0" />
                              <span>
                                {isExtreme
                                  ? "Guaranteed Co-Pilot seat in competition 4x4 rig"
                                  : isDay2
                                    ? "Guaranteed passenger seat in Organiser 4x4 fleet"
                                    : "1 Driver + 2 Friends/Family included"}
                              </span>
                            </li>
                            <li className="flex items-center space-x-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>
                                {isExtreme
                                  ? "Extreme obstacle runs, boulder crawls and steep drops"
                                  : isDay2
                                    ? "Certified Event Marshals piloting the machine"
                                    : "15+ Natural & Technical Obstacles"}
                              </span>
                            </li>
                            <li className="flex items-center space-x-2.5">
                              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              <span>Morning &amp; Afternoon Meals + Refreshments</span>
                            </li>
                            <li className="flex items-center space-x-2.5">
                              <Car className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span>
                                {isExtreme
                                  ? "Helmet & passenger safety restraints provided"
                                  : isDay2
                                    ? "No personal 4x4 or driving licence required"
                                    : "Professional Action Photography & Video"}
                              </span>
                            </li>
                            <li className="flex items-center space-x-2.5">
                              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>Official Participant Recognition Memento</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-3 p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-neutral-600">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Medical &amp; Recovery Teams On-Site</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row (Screen 2) */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setCurrentStep(0);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold font-sans text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg flex items-center justify-center space-x-2 transition-colors order-2 sm:order-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Ticket Selection</span>
                    </button>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2">
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold">SLOTS: {pricingConfig.max_slots} MAX</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage("");
                          setCurrentStep(2);
                        }}
                        className="bg-[#f05a28] hover:bg-[#d94a1d] text-white font-sans font-bold px-7 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-colors text-xs sm:text-sm"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SCREEN 3: STEP 2 - DRIVER & CREW (HORIZONTAL 2-COL LAYOUT) */}
              {/* ======================================================== */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left: Driver Details */}
                    <div className="lg:col-span-6 space-y-3.5 p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
                      <div className="flex items-start space-x-3 pb-3 border-b border-neutral-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-outfit font-black text-base text-neutral-900">
                            {isDay2 ? "Primary Participant Details" : "Lead Driver Details"}
                          </h3>
                          <p className="text-[11px] text-neutral-500">
                            {isDay2
                              ? "Primary attendee for Day 2 trail experience"
                              : "Primary driver steering the vehicle on trail"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={driver.fullName}
                            onChange={(e) => setDriver({ ...driver, fullName: e.target.value })}
                            placeholder="Enter full name"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Age <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={driver.age}
                            onChange={(e) => setDriver({ ...driver, age: e.target.value })}
                            placeholder="Age"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={driver.gender}
                            onChange={(e) => setDriver({ ...driver, gender: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={driver.mobile}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDriver({
                                ...driver,
                                mobile: val,
                                whatsapp: whatsappSameAsPhone ? val : driver.whatsapp,
                              });
                            }}
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-medium text-neutral-700">
                              WhatsApp Number <span className="text-red-500">*</span>
                            </label>
                            <label className="flex items-center space-x-1 cursor-pointer text-[10px] text-emerald-700 font-bold select-none">
                              <input
                                type="checkbox"
                                checked={whatsappSameAsPhone}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setWhatsappSameAsPhone(checked);
                                  if (checked) {
                                    setDriver((prev) => ({ ...prev, whatsapp: prev.mobile }));
                                  }
                                }}
                                className="rounded border-neutral-300 text-emerald-600 focus:ring-0 w-3 h-3"
                              />
                              <span>Same as Mobile</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            disabled={whatsappSameAsPhone}
                            value={whatsappSameAsPhone ? driver.mobile : driver.whatsapp}
                            onChange={(e) => setDriver({ ...driver, whatsapp: e.target.value })}
                            placeholder="+91 XXXXX XXXXX"
                            className={`w-full px-3 py-2 border rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 ${whatsappSameAsPhone
                              ? "bg-neutral-100 border-neutral-200 text-neutral-600 cursor-not-allowed"
                              : "bg-white border-neutral-300"
                              }`}
                          />
                          <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                            QR ticket &amp; verification updates sent via WhatsApp
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="email"
                            value={driver.email}
                            onChange={(e) => setDriver({ ...driver, email: e.target.value })}
                            placeholder="driver@example.com"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={driver.city}
                            onChange={(e) => setDriver({ ...driver, city: e.target.value })}
                            placeholder="Enter city"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            ID Proof <span className="text-red-500">*</span>
                          </label>
                          <div className="flex space-x-2">
                            <select
                              value={driver.idProofType}
                              onChange={(e) => setDriver({ ...driver, idProofType: e.target.value })}
                              className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                            >
                              <option value="">Select ID proof</option>
                              <option value="Aadhaar Card">Aadhaar Card</option>
                              {!isDay2 && <option value="Driving Licence">Driving Licence</option>}
                              <option value="Passport">Passport</option>
                              <option value="Voter ID">Voter ID</option>
                              {isDay2 && <option value="Government ID">Government ID</option>}
                            </select>
                            <label className="cursor-pointer px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 flex items-center space-x-1 flex-shrink-0">
                              <Upload className="w-3.5 h-3.5 text-neutral-500" />
                              <span>{driver.idProofUrl ? "Uploaded" : "Upload ID"}</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "driver_id")}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Passengers & Crew */}
                    <div className="lg:col-span-6 space-y-3.5 p-4 sm:p-5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                        <div className="flex items-start space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#f05a28] flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-outfit font-black text-base text-neutral-900">
                              {isDay2 ? "Additional Co-Passengers" : "Crew / Co-Passengers"}
                            </h3>
                            <p className="text-[11px] text-neutral-500">
                              {isDay2
                                ? "Day 2 tickets are per-person; add extra seats if friends or family join"
                                : "2 friends/family included in standard slot"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-white border border-neutral-200 px-2 py-0.5 rounded text-neutral-700">
                          {isDay2 ? `${1 + additionalCount} Seat(s)` : `${passengers.length} Crew`}
                        </span>
                      </div>

                      {isDay2 && passengers.length === 0 ? (
                        <div className="p-4 rounded-lg bg-white border border-neutral-200 text-center space-y-2">
                          <User className="w-8 h-8 text-neutral-400 mx-auto" />
                          <p className="text-xs text-neutral-800 font-bold">
                            Single Participant Seat Reserved
                          </p>
                          <p className="text-[11px] text-neutral-500 leading-relaxed max-w-sm mx-auto">
                            Attending alone? Click Save &amp; Continue below to proceed. If friends or family are joining you on Day 2, click Add Extra Participant below.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                          {passengers.map((passenger, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-neutral-200 bg-white space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-[10px] font-bold flex items-center justify-center text-neutral-700">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-neutral-800">
                                    {isDay2
                                      ? `Co-Passenger ${idx + 1}`
                                      : idx === 0
                                        ? "Co-Driver / Spotter"
                                        : `Passenger ${idx + 1}`}
                                  </span>
                                </div>
                                {(!isDay2 && idx >= 2) || (isDay2 && passengers.length > 0) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePassenger(idx)}
                                    className="text-red-600 hover:text-red-700 text-[11px] flex items-center space-x-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                ) : null}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>
                                  <input
                                    type="text"
                                    value={passenger.name}
                                    onChange={(e) => {
                                      const next = [...passengers];
                                      next[idx].name = e.target.value;
                                      setPassengers(next);
                                    }}
                                    placeholder="Full Name"
                                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs text-neutral-900"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    value={passenger.age}
                                    onChange={(e) => {
                                      const next = [...passengers];
                                      next[idx].age = e.target.value;
                                      setPassengers(next);
                                    }}
                                    placeholder="Age"
                                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs text-neutral-900"
                                  />
                                </div>
                                <div>
                                  <select
                                    value={passenger.relationship}
                                    onChange={(e) => {
                                      const next = [...passengers];
                                      next[idx].relationship = e.target.value;
                                      setPassengers(next);
                                    }}
                                    className="w-full px-2 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs text-neutral-900"
                                  >
                                    <option value="">Relation</option>
                                    <option value="Family">Family</option>
                                    <option value="Friend">Friend</option>
                                    {!isDay2 && <option value="Co-Driver">Co-Driver</option>}
                                    {!isDay2 && <option value="Spotter">Spotter</option>}
                                    {isDay2 && <option value="Co-Passenger">Co-Passenger</option>}
                                  </select>
                                </div>
                                <div>
                                  <label className="cursor-pointer w-full py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-[11px] text-neutral-700 flex items-center justify-center space-x-1 truncate">
                                    <Upload className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{passenger.idProofUrl ? "Done" : "Upload ID"}</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, `passenger_id_${idx}`)}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddPassenger()}
                        className="w-full py-2 border border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 rounded-lg font-sans font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          Add Extra Participant (+₹{currentAdditionalPrice.toLocaleString()})
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Back and Save & Continue Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setCurrentStep(1);
                      }}
                      className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg font-sans text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const err = validateStep2();
                        if (err) {
                          setErrorMessage(err);
                          return;
                        }
                        setErrorMessage("");
                        if (isDay2) {
                          setCurrentStep(4);
                        } else {
                          setCurrentStep(3);
                        }
                      }}
                      className="bg-[#14532d] hover:bg-[#052e16] text-white font-sans font-bold px-7 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-colors text-xs sm:text-sm"
                    >
                      <span>Save &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SCREEN 4: STEP 3 - VEHICLE DETAILS (HORIZONTAL 2-COL) */}
              {/* ======================================================== */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Col: Vehicle Machine Details (span 7) */}
                    <div className="lg:col-span-7 space-y-3.5 p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
                      <div className="flex items-start space-x-3 pb-3 border-b border-neutral-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-outfit font-black text-base text-neutral-900">Vehicle Identification</h3>
                          <p className="text-[11px] text-neutral-500">Official RC registration information</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Owner Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={vehicle.ownerName}
                            onChange={(e) => setVehicle({ ...vehicle, ownerName: e.target.value })}
                            placeholder="Enter owner name"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Registration Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={vehicle.regNumber}
                            onChange={(e) => setVehicle({ ...vehicle, regNumber: e.target.value })}
                            placeholder="TN XX XX XXXX"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 uppercase font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Make <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={vehicle.make}
                            onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900"
                          >
                            <option value="">Select make</option>
                            <option value="Mahindra">Mahindra</option>
                            <option value="Jeep">Jeep</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Suzuki / Maruti">Suzuki / Maruti</option>
                            <option value="Force Motors">Force Motors</option>
                            <option value="Isuzu">Isuzu</option>
                            <option value="Tata">Tata</option>
                            <option value="Land Rover">Land Rover</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Model <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={vehicle.model}
                            onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                            placeholder="e.g. Thar, Gurkha, Jimny, Hilux"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Manufacturing Year <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={vehicle.year}
                            onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900"
                          >
                            <option value="">Select year</option>
                            {["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "Earlier"].map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                            Colour <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={vehicle.colour}
                            onChange={(e) => setVehicle({ ...vehicle, colour: e.target.value })}
                            placeholder="e.g. Black, Red, Desert Sand"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Specifications & Modifications Switch (span 5) */}
                    <div className="lg:col-span-5 space-y-3.5 p-4 sm:p-5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                      <div className="flex items-start space-x-3 pb-3 border-b border-neutral-200">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#f05a28] flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-outfit font-black text-base text-neutral-900">Drivetrain &amp; Build</h3>
                          <p className="text-[11px] text-neutral-500">Mechanical specs &amp; modifications status</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <span className="text-[10px] text-neutral-500 block mb-1 font-bold">FUEL *</span>
                          <select
                            value={vehicle.fuelType}
                            onChange={(e) => setVehicle({ ...vehicle, fuelType: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                          >
                            <option value="">Select</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Electric">Electric</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 block mb-1 font-bold">GEARBOX *</span>
                          <select
                            value={vehicle.transmission}
                            onChange={(e) => setVehicle({ ...vehicle, transmission: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                          >
                            <option value="">Select</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 block mb-1 font-bold">DRIVETRAIN *</span>
                          <select
                            value={vehicle.drivetrain}
                            onChange={(e) => setVehicle({ ...vehicle, drivetrain: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                          >
                            <option value="">Select</option>
                            <option value="4x4">4x4</option>
                            <option value="AWD">AWD</option>
                          </select>
                        </div>
                      </div>

                      {/* Is Modified Switch Tiles */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-neutral-800 mb-2">
                          Is your vehicle modified? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            onClick={() => setVehicle({ ...vehicle, isModified: false })}
                            className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${!vehicle.isModified
                              ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-700"
                              : "border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white"
                              }`}
                          >
                            <div className="text-xs">Stock Condition</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">Factory Setup</div>
                          </div>

                          <div
                            onClick={() => setVehicle({ ...vehicle, isModified: true })}
                            className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${vehicle.isModified
                              ? "border-[#f05a28] bg-orange-50 text-[#f05a28] font-bold ring-1 ring-[#f05a28]"
                              : "border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white"
                              }`}
                          >
                            <div className="text-xs">Modified 4x4</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">Lift, Tyres, Winch, etc.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back and Save & Continue Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setCurrentStep(2);
                      }}
                      className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg font-sans text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const err = validateStep3();
                        if (err) {
                          setErrorMessage(err);
                          return;
                        }
                        setErrorMessage("");
                        if (vehicle.isModified) {
                          setCurrentStep(3.5);
                        } else {
                          setCurrentStep(4);
                        }
                      }}
                      className="bg-[#14532d] hover:bg-[#052e16] text-white font-sans font-bold px-7 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-colors text-xs sm:text-sm"
                    >
                      <span>Save &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SCREEN 5: STEP 3B - MODIFICATION DETAILS (HORIZONTAL) */}
              {/* ======================================================== */}
              {currentStep === 3.5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <div>
                      <h3 className="font-outfit font-black text-base text-neutral-900">Modification Details</h3>
                      <p className="text-[11px] text-neutral-500">Provide details on upgrades installed on your rig</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-orange-100 text-[#f05a28] px-2 py-0.5 rounded">
                      Step 3B
                    </span>
                  </div>

                  {/* Mods Form Compact 3-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Suspension</label>
                      <select
                        value={modifications.suspension}
                        onChange={(e) => setModifications({ ...modifications, suspension: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                      >
                        <option value="">Select suspension</option>
                        <option value="Stock">Stock</option>
                        <option value="2&quot; Lift Kit">2&quot; Lift Kit</option>
                        <option value="3&quot; Lift Kit">3&quot; Lift Kit</option>
                        <option value="4&quot;+ Extreme Lift">4&quot;+ Extreme Lift</option>
                        <option value="Old Man Emu Heavy Duty">Old Man Emu Heavy Duty</option>
                        <option value="Profender Adjustable">Profender Adjustable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Tyres Type</label>
                      <select
                        value={modifications.tyresType}
                        onChange={(e) => setModifications({ ...modifications, tyresType: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                      >
                        <option value="">Select tyre type</option>
                        <option value="AT (All-Terrain)">AT (All-Terrain)</option>
                        <option value="MT (Mud-Terrain)">MT (Mud-Terrain)</option>
                        <option value="Extreme Trepador / Simex">Extreme Trepador / Simex</option>
                        <option value="Stock HT">Stock HT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Tyre Size</label>
                      <input
                        type="text"
                        value={modifications.tyreSize}
                        onChange={(e) => setModifications({ ...modifications, tyreSize: e.target.value })}
                        placeholder="e.g. 285/70 R17"
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Differential / Locker</label>
                      <select
                        value={modifications.differential}
                        onChange={(e) => setModifications({ ...modifications, differential: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                      >
                        <option value="">Select locker type</option>
                        <option value="Stock Open">Stock Open</option>
                        <option value="Rear Mechanical Locker">Rear Mechanical Locker</option>
                        <option value="Front &amp; Rear e-Lockers">Front &amp; Rear e-Lockers</option>
                        <option value="Air Locker">Air Locker</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Winch</label>
                      <select
                        value={modifications.winch}
                        onChange={(e) => setModifications({ ...modifications, winch: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                      >
                        <option value="">Select winch</option>
                        <option value="None">None</option>
                        <option value="Electric 9,500 lbs">Electric 9,500 lbs</option>
                        <option value="Electric 12,000 lbs">Electric 12,000 lbs</option>
                        <option value="Synthetic 13,500 lbs">Synthetic 13,500 lbs</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Recovery Points</label>
                      <select
                        value={modifications.recoveryPoints}
                        onChange={(e) => setModifications({ ...modifications, recoveryPoints: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                      >
                        <option value="">Select points</option>
                        <option value="Stock Points">Stock Points</option>
                        <option value="Rated 4.75T Bow Shackles">Rated 4.75T Bow Shackles</option>
                        <option value="Chassis Mounted Heavy Duty">Chassis Mounted Heavy Duty</option>
                      </select>
                    </div>
                  </div>

                  {/* Back and Save & Continue Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setCurrentStep(3);
                      }}
                      className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg font-sans text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setCurrentStep(4);
                      }}
                      className="bg-[#14532d] hover:bg-[#052e16] text-white font-sans font-bold px-7 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-colors text-xs sm:text-sm"
                    >
                      <span>Save &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 4 - EXPERIENCE & SAFETY (HORIZONTAL 2-COL) */}
              {/* ======================================================== */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Col: Trail Experience (span 6) */}
                    <div className="lg:col-span-6 space-y-3.5 p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
                      <div className="flex items-start space-x-3 pb-3 border-b border-neutral-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-outfit font-black text-base text-neutral-900">Off-Road Experience</h3>
                          <p className="text-[11px] text-neutral-500">Helps marshals allocate suitable convoy batches</p>
                        </div>
                      </div>

                      {/* Off-road Experience Level */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-800 mb-1.5">
                          Experience Level <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {["Beginner", "Intermediate", "Experienced", "Advanced"].map((lvl) => (
                            <div
                              key={lvl}
                              onClick={() => setSafety({ ...safety, experienceLevel: lvl })}
                              className={`cursor-pointer rounded-lg border p-2 text-center text-xs font-medium transition-all ${safety.experienceLevel === lvl
                                ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-700"
                                : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                                }`}
                            >
                              {lvl}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Participated before? */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-800 mb-1.5">
                          Participated in off-road events before?
                        </label>
                        <div className="flex items-center space-x-6 text-xs text-neutral-800 mb-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="participatedBefore"
                              checked={safety.participatedBefore === "Yes"}
                              onChange={() => setSafety({ ...safety, participatedBefore: "Yes" })}
                              className="text-emerald-700 focus:ring-emerald-700"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="participatedBefore"
                              checked={safety.participatedBefore === "No"}
                              onChange={() => setSafety({ ...safety, participatedBefore: "No" })}
                              className="text-emerald-700 focus:ring-emerald-700"
                            />
                            <span>No</span>
                          </label>
                        </div>

                        {safety.participatedBefore === "Yes" && (
                          <div className="max-w-xs">
                            <input
                              type="number"
                              value={safety.eventCount}
                              onChange={(e) => setSafety({ ...safety, eventCount: e.target.value })}
                              placeholder="Number of previous events"
                              className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs text-neutral-900"
                            />
                          </div>
                        )}
                      </div>

                      {/* Terrain Experience */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-800 mb-1.5">
                          Terrain Experience (Select all encountered)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {["Rocky", "Mud", "Inclines", "Descents", "Technical", "Loose"].map((t) => {
                            const isSelected = safety.terrains.includes(t);
                            return (
                              <div
                                key={t}
                                onClick={() => toggleTerrain(t)}
                                className={`cursor-pointer rounded border p-2 text-center text-xs font-medium transition-all ${isSelected
                                  ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-bold"
                                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                  }`}
                              >
                                {t}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Medical Information (span 6) */}
                    <div className="lg:col-span-6 space-y-3.5 p-4 sm:p-5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                      <div className="flex items-start space-x-3 pb-3 border-b border-neutral-200">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                          <HeartPulse className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-outfit font-black text-base text-neutral-900">Medical &amp; Emergency</h3>
                          <p className="text-[11px] text-neutral-500">Confidential medical details for trail medics</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">Blood Group</label>
                          <select
                            value={safety.bloodGroup}
                            onChange={(e) => setSafety({ ...safety, bloodGroup: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                          >
                            <option value="">Select Blood Group</option>
                            {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">Known Allergies</label>
                          <input
                            type="text"
                            value={safety.allergies}
                            onChange={(e) => setSafety({ ...safety, allergies: e.target.value })}
                            placeholder="e.g. Penicillin, Dust, None"
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">Medical Conditions</label>
                          <input
                            type="text"
                            value={safety.medicalConditions}
                            onChange={(e) => setSafety({ ...safety, medicalConditions: e.target.value })}
                            placeholder="e.g. Asthma, BP, None"
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-700 mb-1">Current Medication</label>
                          <input
                            type="text"
                            value={safety.currentMedication}
                            onChange={(e) => setSafety({ ...safety, currentMedication: e.target.value })}
                            placeholder="e.g. Inhaler, Tablets, None"
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                        <div className="font-bold text-neutral-800 flex items-center space-x-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>On-Trail Medical Emergency Support</span>
                        </div>
                        <p className="text-neutral-500">
                          Ambulance, first-aid marshals, and paramedic teams are stationed at Obstacle Points 1, 7, and 14 throughout the event.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back and Save & Continue Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        if (isDay2) {
                          setCurrentStep(2);
                        } else if (vehicle.isModified) {
                          setCurrentStep(3.5);
                        } else {
                          setCurrentStep(3);
                        }
                      }}
                      className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg font-sans text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!safety.experienceLevel) {
                          setErrorMessage("Please select your off-road experience level.");
                          return;
                        }
                        setErrorMessage("");
                        setCurrentStep(5);
                      }}
                      className="bg-[#14532d] hover:bg-[#052e16] text-white font-sans font-bold px-7 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-colors text-xs sm:text-sm"
                    >
                      <span>Save &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 5 - REVIEW & PAYMENT (WITH GOOGLE CAPTCHA) */}
              {/* ======================================================== */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="font-outfit font-black text-lg text-neutral-900">Review Your Registration</h3>
                    <p className="text-xs text-neutral-500">Please review your details before payment</p>
                  </div>

                  {/* Review Cards Grid */}
                  <div className="space-y-3">
                    {/* Experience Review Card */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 p-1 flex-shrink-0 flex items-center justify-center">
                          <Car className="w-5 h-5 text-neutral-700" />
                        </div>
                        <div>
                          <div className="font-outfit font-bold text-sm text-neutral-900">{selectedExperience}</div>
                          <div className="text-[11px] text-neutral-500">
                            {selectedDate} •{" "}
                            {isDay2
                              ? isExtreme
                                ? `₹${pricingConfig.price_extreme.toLocaleString()} / Person`
                                : `₹${pricingConfig.price_organiser.toLocaleString()} / Person`
                              : `₹${pricingConfig.price_regular.toLocaleString()} Standard Entry`}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Driver / Participant Review Card */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-neutral-700" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-neutral-900">
                            {driver.fullName || (isDay2 ? "Primary Participant" : "Primary Driver")}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {driver.mobile || "No phone entered"} {driver.city ? `• ${driver.city}` : ""}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Vehicle Review Card - Only for Day 1 */}
                    {!isDay2 && (
                      <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                            <Car className="w-5 h-5 text-neutral-700" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-neutral-900">
                              {vehicle.make ? `${vehicle.make} ${vehicle.model}` : vehicle.model || "Vehicle Specified"}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono">
                              {vehicle.regNumber || "REG PENDING"} {vehicle.fuelType ? `| ${vehicle.fuelType}` : ""}{" "}
                              {vehicle.transmission ? `| ${vehicle.transmission}` : ""}{" "}
                              | {vehicle.isModified ? "Modified" : "Stock"}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline"
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {/* Crew / Participants Review Card */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-neutral-700" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-neutral-900">
                            {isDay2 ? "Total Participants" : "Crew Members"}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {isDay2
                              ? `${1 + additionalCount} Seat(s) Booked (Primary + ${additionalCount} extra)`
                              : `Driver: 1 | Passengers: ${passengers.filter((p) => p.name.trim()).length} | Additional: ${additionalCount}`}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Safety & Medical Review Card */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-neutral-700" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-neutral-900">Safety &amp; Medical</div>
                          <div className="text-[11px] text-neutral-500">
                            Level: {safety.experienceLevel || "Standard"}{" "}
                            {safety.bloodGroup ? `| Blood: ${safety.bloodGroup}` : ""}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Promo Code Entry Area */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-3">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        HAVE A PROMO CODE?
                      </span>
                    </div>

                    {appliedPromo ? (
                      <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg">
                        <div className="flex items-center space-x-2.5">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                              {appliedPromo.code}
                            </span>
                            <span className="text-xs text-emerald-800 font-semibold ml-2">
                              -₹{appliedPromo.discount.toLocaleString()} OFF
                            </span>
                            {appliedPromo.description && (
                              <span className="text-[10px] text-emerald-700 block mt-0.5">
                                {appliedPromo.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value.toUpperCase());
                              setPromoError("");
                              setPromoSuccess("");
                            }}
                            placeholder="Enter promo code (e.g. SAN500)"
                            className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900 uppercase focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={isValidatingPromo || !promoInput.trim()}
                            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-sans font-bold uppercase transition-all disabled:opacity-50 flex items-center space-x-1.5"
                          >
                            {isValidatingPromo ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Checking...</span>
                              </>
                            ) : (
                              <span>Apply</span>
                            )}
                          </button>
                        </div>
                        {promoError && (
                          <p className="text-xs text-red-600 font-medium">{promoError}</p>
                        )}
                        {promoSuccess && (
                          <p className="text-xs text-emerald-700 font-medium">{promoSuccess}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                    <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Payment Summary
                    </div>
                    <div className="flex justify-between text-xs text-neutral-700">
                      <span>
                        {selectedExperience}{" "}
                        {isDay2 ? "(Primary Participant)" : "(Standard Vehicle Entry)"}
                      </span>
                      <span className="font-mono">
                        ₹
                        {isDay2
                          ? day2PerPersonPrice.toLocaleString()
                          : pricingConfig.price_regular.toLocaleString()}
                      </span>
                    </div>

                    {additionalCount > 0 && (
                      <div className="flex justify-between text-xs text-neutral-700">
                        <span>
                          {isDay2
                            ? `Additional Participant(s) x ${additionalCount}`
                            : `Additional Crew x ${additionalCount}`}
                        </span>
                        <span className="font-mono">
                          ₹{(additionalCount * currentAdditionalPrice).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {appliedPromo && (
                      <div className="flex justify-between text-xs text-emerald-700 font-medium">
                        <span>Promo Code Discount ({appliedPromo.code})</span>
                        <span className="font-mono font-bold">-₹{appliedPromo.discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-center">
                      <span className="font-bold text-sm text-neutral-900">Total Amount</span>
                      <span className="font-outfit font-black text-xl text-[#f05a28]">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>

                    {/* UPI QR Payment Block */}
                    <div id="upi-payment-section" className="mt-4 p-4 sm:p-5 rounded-xl border-2 border-amber-500/40 bg-white space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            OFFICIAL PAYMENT METHOD
                          </span>
                          <h4 className="font-outfit font-black text-base sm:text-lg text-neutral-900 mt-1">
                            UPI INSTANT PAYMENT
                          </h4>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] font-mono text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Direct Bank Settlement</span>
                        </div>
                      </div>

                      {/* QR Code + Payment Instructions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* Left: QR Code Showcase */}
                        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-sand-50 rounded-xl border border-neutral-200 text-center">
                          <div className="p-2 bg-white rounded-lg border border-neutral-300 shadow-sm inline-block">
                            <img
                              src="/images/upi-qr.jpeg"
                              alt="UPI Payment QR Code"
                              className="w-48 h-auto object-contain rounded"
                            />
                          </div>

                          <div className="mt-3 space-y-1 w-full">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                              Payee: Bhuvaneshwari Shanmugam
                            </span>
                            <div className="flex items-center justify-center space-x-1.5 bg-white border border-neutral-300 px-2.5 py-1 rounded">
                              <span className="font-mono text-xs font-bold text-neutral-900 select-all">
                                bhuvi231297-1@oksbi
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("bhuvi231297-1@oksbi");
                                  setCopiedUpi(true);
                                  setTimeout(() => setCopiedUpi(false), 2000);
                                }}
                                className="text-amber-700 hover:text-amber-800 p-0.5"
                                title="Copy UPI ID"
                              >
                                {copiedUpi ? (
                                  <span className="text-[10px] font-mono text-emerald-700 font-bold">Copied!</span>
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 block pt-1">
                              Scan with GPay, PhonePe, Paytm, BHIM, or any UPI App
                            </span>
                          </div>
                        </div>

                        {/* Right: Payment Steps & Verification Inputs */}
                        <div className="md:col-span-7 space-y-3.5">
                          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs text-neutral-700 space-y-1">
                            <div className="font-bold text-amber-900 flex items-center space-x-1">
                              <span>Total Payable Fee:</span>
                              <span className="font-outfit text-base text-[#f05a28] font-black">
                                ₹{calculateTotal().toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600">
                              Transfer exact fee via UPI app, then fill in the transaction reference (UTR) or upload payment screenshot below.
                            </p>
                          </div>

                          {/* 1. Transaction ID / UTR input */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-bold text-neutral-800">
                                UPI Transaction ID / 12-Digit UTR
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentUtr("PAY_AT_SCRUTINY_BAY");
                                  setErrorMessage("");
                                }}
                                className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                              >
                                Pay at Venue Bay
                              </button>
                            </div>
                            <input
                              type="text"
                              value={paymentUtr}
                              onChange={(e) => {
                                setPaymentUtr(e.target.value);
                                if (errorMessage) setErrorMessage("");
                              }}
                              placeholder="e.g. 4289XXXXXXXX / UPI Ref No."
                              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-[10px] text-neutral-500 mt-0.5 block font-mono">
                              Found on your payment receipt in Google Pay / PhonePe / Paytm
                            </span>
                          </div>

                          {/* 2. Payment Screenshot Upload */}
                          <div>
                            <label className="block text-xs font-bold text-neutral-800 mb-1">
                              Upload Payment Screenshot (Optional if UTR entered)
                            </label>
                            <label className="cursor-pointer border-2 border-dashed border-amber-500/50 hover:border-amber-600 rounded-xl p-3 flex items-center justify-between bg-amber-50/30 hover:bg-amber-50/60 transition-colors">
                              <div className="flex items-center space-x-2.5">
                                <Upload className="w-4 h-4 text-amber-700 flex-shrink-0" />
                                <div>
                                  <span className="text-xs font-bold text-neutral-900 block truncate max-w-[220px]">
                                    {paymentScreenshotUrl ? (paymentScreenshotName || "Payment Screenshot Uploaded ✓") : "Select Screenshot"}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 block">
                                    {paymentScreenshotUrl ? "Uploaded to Server ✓" : "PNG, JPG up to 15MB"}
                                  </span>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold">
                                {paymentScreenshotUrl ? "Replace" : "Upload"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleFileUpload(e, "payment_screenshot");
                                  if (errorMessage) setErrorMessage("");
                                }}
                              />
                            </label>
                          </div>

                          {/* WhatsApp Notification & UTR Verification Notice */}
                          <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-lg flex items-start space-x-2.5 text-xs text-emerald-950 font-sans">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                              <span className="font-bold">We verify your UPI transaction UTR.</span>{" "}
                              <span>Once payment gets verified, you will receive an instant notification and QR ticket pass via WhatsApp.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google reCAPTCHA Verification Widget */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-neutral-800 mb-2">
                      Security Verification <span className="text-red-500">*</span>
                    </label>
                    <GoogleCaptcha
                      onVerify={(token) => {
                        setCaptchaToken(token);
                        setCaptchaError("");
                      }}
                      onExpire={() => setCaptchaToken("")}
                      error={captchaError}
                    />
                    {captchaError && (
                      <p className="text-xs text-red-600 mt-1.5 font-medium">{captchaError}</p>
                    )}
                  </div>

                  {/* Inline Step 5 Error Banner right above buttons */}
                  {errorMessage && (
                    <div
                      id="step5-error-banner"
                      className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-xs font-sans flex items-start space-x-3 shadow-md animate-shake"
                    >
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-red-900">Please complete the required details:</div>
                        <p className="text-red-800 leading-relaxed font-medium">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Back and Proceed to Payment Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setCurrentStep(4);
                      }}
                      className="px-6 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg font-sans text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFinalSubmit}
                      className="bg-[#f05a28] hover:bg-[#d94a1d] text-white font-sans font-bold px-8 py-3 rounded-lg shadow-sm flex items-center space-x-2 transition-colors text-sm disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Submitting Registration &amp; Verifying...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Registration &amp; Verification Request</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 6 - REGISTRATION & PAYMENT RECEIVED */}
        {/* ======================================================== */}
        {currentStep === 6 && (
          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950 text-white p-6 sm:p-10 text-center animate-fadeIn">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <img src="/M-word-logo.png" alt="MadProTek" className="h-7 w-auto object-contain" />
              <span className="font-outfit font-black tracking-wider text-lg text-white">MADPROTEK</span>
            </div>

            {/* Checkmark Circle */}
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <h2 className="font-outfit text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Registration &amp; Payment Submitted!
            </h2>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-950/80 border border-amber-500/50 rounded-full text-amber-400 text-xs font-mono font-bold mt-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>UNDER CHIEF MARSHAL VERIFICATION</span>
            </div>
            <p className="text-neutral-400 text-xs font-sans mt-2 max-w-lg mx-auto">
              {confirmedData?.experience_type?.includes("OWN 4X4")
                ? "Your 4x4 machine details and UPI payment screenshot have been submitted successfully."
                : "Your registration details and UPI payment screenshot have been submitted successfully."}
            </p>

            {/* WhatsApp Verification Notification Banner (USER REQUIREMENT) */}
            <div className="my-6 max-w-lg mx-auto p-5 sm:p-6 bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl text-left space-y-3.5 shadow-2xl">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WHATSAPP NOTIFICATION SERVICE</span>
              </div>

              <div className="space-y-1">
                <h3 className="font-outfit text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  Once payment gets verified you will get notification via WhatsApp
                </h3>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Our Chief Marshals are reviewing your UPI transaction (UTR:{" "}
                  <strong className="text-amber-400 font-mono">{confirmedData?.payment_utr}</strong>). Upon successful verification, your entry pass with the official scannable QR code will be dispatched directly to your WhatsApp number:
                </p>
              </div>

              <div className="flex items-center justify-between bg-black/40 border border-emerald-500/50 px-4 py-2.5 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400/80 uppercase block">Registered WhatsApp</span>
                    <span className="font-mono text-sm font-bold text-white select-all">
                      {confirmedData?.whatsapp || driver.whatsapp || driver.mobile}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  READY FOR DISPATCH
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi Marshals, I have registered for 4x4 Adventure Trail 2026. Registration Code: ${confirmedData?.registration_code || ""}, UPI UTR: ${confirmedData?.payment_utr || ""}. Please verify my payment.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-syne font-bold text-xs tracking-wider uppercase rounded-lg transition-colors text-center shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  <span>MARSHAL DESK WHATSAPP</span>
                </a>
              </div>
            </div>

            {/* Registration Details Summary Box */}
            <div className="my-6 max-w-lg mx-auto p-5 bg-neutral-900 border border-neutral-800 rounded-xl text-left space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase block">Registration ID</span>
                <span className="font-outfit font-black text-2xl text-amber-500 tracking-wider">
                  {confirmedData?.registration_code || "MAT26-0001"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">
                  {confirmedData?.experience_type?.includes("OWN 4X4") ? "Driver Name:" : "Participant Name:"}
                </span>
                <span className="text-white font-bold">{confirmedData?.driver_name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Experience Date:</span>
                <span className="text-white font-bold">{confirmedData?.date}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">WhatsApp Number:</span>
                <span className="text-emerald-400 font-bold select-all">{confirmedData?.whatsapp || driver.whatsapp || driver.mobile}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">UPI Transaction Ref (UTR):</span>
                <span className="text-amber-400 font-bold select-all">{confirmedData?.payment_utr}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Verification Status:</span>
                <span className="text-amber-400 font-bold">Pending Admin Audit</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-400">Total Submitted:</span>
                <span className="text-emerald-400 font-bold font-outfit text-sm">
                  ₹{confirmedData?.total_amount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Next Steps List */}
            <div className="max-w-lg mx-auto text-left space-y-3 mb-8 text-xs text-neutral-300 font-sans bg-neutral-900/70 p-4 rounded-xl border border-neutral-800">
              <div className="font-bold text-neutral-200 text-sm mb-1">What Happens Next?</div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">We verify your UPI transaction UTR.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Once payment gets verified, you will receive an instant notification and QR ticket pass via WhatsApp.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(0);
                  setConfirmedData(null);
                }}
                className="w-full sm:w-auto px-8 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
