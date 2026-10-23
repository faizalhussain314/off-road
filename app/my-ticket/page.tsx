"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Car,
  Compass,
  Calendar,
  MapPin,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Radio,
  FileCheck,
  User,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";

function TicketContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code") || searchParams.get("search") || "";
  const adminKeyParam = searchParams.get("admin_key") || "";

  const [identifierInput, setIdentifierInput] = useState(codeParam);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [ticketData, setTicketData] = useState<any>(null);
  const [ticketError, setTicketError] = useState("");

  // Auto-fetch if codeParam exists or saved session
  useEffect(() => {
    if (codeParam) {
      setIdentifierInput(codeParam);
      setLoading(true);
      fetch(`/api/tickets/my-ticket?code=${encodeURIComponent(codeParam)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setTicketData(res.data);
            setIsLoggedIn(true);
          } else {
            setAuthError(res.error || "Ticket record not found.");
          }
        })
        .catch(() => {
          setAuthError("Failed to fetch ticket. Please verify your connection.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      const savedToken = typeof window !== "undefined" ? sessionStorage.getItem("driver_session_token") : null;
      if (savedToken) {
        setLoading(true);
        fetch("/api/tickets/my-ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_token: savedToken }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.success && res.data) {
              setTicketData(res.data);
              setIsLoggedIn(true);
            }
          })
          .catch(() => {})
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [codeParam]);

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tickets/my-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifierInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No ticket found for this code or phone number.");
      }

      if (data.session_token && typeof window !== "undefined") {
        sessionStorage.setItem("driver_session_token", data.session_token);
      }

      setTicketData(data.data);
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError(err.message || "Invalid ticket identifier.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("driver_session_token");
    }
    setIsLoggedIn(false);
    setTicketData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md w-full mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-white shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-[10px] font-mono tracking-tactical text-amber-500 uppercase font-bold mb-1">
            PARTICIPANT PORTAL
          </div>
          <h1 className="font-outfit text-2xl font-black uppercase tracking-tight">
            MY 4X4 EVENT TICKET
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-2">
            Enter your Registration Code (e.g. MAT26-0001) or WhatsApp / Mobile Number to view your verified entry pass.
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-sm text-red-200 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLookupSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">
              REGISTRATION CODE OR WHATSAPP / MOBILE NUMBER
            </label>
            <input
              type="text"
              required
              value={identifierInput}
              onChange={(e) => setIdentifierInput(e.target.value)}
              placeholder="e.g. MAT26-0001 or 9698258311"
              className="w-full px-3.5 py-3 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-syne font-bold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>{loading ? "SEARCHING TICKET..." : "VIEW MY EVENT TICKET"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-neutral-700">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs uppercase tracking-wider">Loading Official Ticket Pass...</p>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white p-8 rounded border border-neutral-200">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h2 className="font-outfit text-xl font-bold uppercase">No Ticket Found</h2>
        <p className="text-xs text-neutral-600 mt-2">
          Could not find an active registration record matching this identifier.
        </p>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="mt-4 px-4 py-2 bg-neutral-900 text-white text-xs font-mono uppercase rounded"
        >
          Back to Login
        </button>
      </div>
    );
  }

  const isVerified = ticketData.is_verified;
  const isCheckedIn = ticketData.checkin_status === "CHECKED_IN";

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 print:space-y-0 print:m-0 print:p-0 print:max-w-none">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between no-print print:hidden">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-neutral-500">SIGNED IN AS:</span>
          <span className="font-bold text-neutral-900">{ticketData.driver_name}</span>
          <span className="text-neutral-400">({ticketData.registration_code})</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const token = typeof window !== "undefined" ? sessionStorage.getItem("driver_session_token") : null;
              if (token) {
                fetch("/api/tickets/my-ticket", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ session_token: token }),
                })
                  .then((r) => r.json())
                  .then((res) => {
                    if (res.success && res.data) setTicketData(res.data);
                  });
              }
            }}
            className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-xs font-mono rounded flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3 text-neutral-600" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-mono rounded flex items-center space-x-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Lock / Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status Matrix Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4 no-print print:hidden">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">
              REGISTRATION ID
            </span>
            <span className="font-outfit font-black text-xl text-neutral-900">
              {ticketData.registration_code}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">
              PACKAGE
            </span>
            <span className="font-outfit font-bold text-xs text-neutral-800">
              {ticketData.experience_type} ({ticketData.experience_date})
            </span>
          </div>
        </div>

        {/* 2-Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Payment Status */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Payment</span>
            <span
              className={`font-mono text-xs font-bold mt-1 px-2 py-0.5 rounded text-center ${
                ticketData.payment_status === "PAID"
                  ? "bg-emerald-100 text-emerald-800"
                  : ticketData.payment_status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {ticketData.payment_status || "PENDING"}
            </span>
          </div>

          {/* 2. Ticket Status */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Ticket Issuance</span>
            <span
              className={`font-mono text-xs font-bold mt-1 px-2 py-0.5 rounded text-center ${
                ticketData.ticket_status === "ISSUED"
                  ? "bg-emerald-100 text-emerald-800"
                  : ticketData.ticket_status === "REVOKED"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {ticketData.ticket_status === "ISSUED" ? "ISSUED" : "PENDING"}
            </span>
          </div>
        </div>
      </div>

      {/* Official Guidance Banner (Verbatim from API/Requirements) */}
      <div
        className={`p-5 sm:p-6 rounded-xl border-2 no-print print:hidden ${
          isVerified
            ? "bg-emerald-50 border-emerald-400 text-emerald-950"
            : ticketData.payment_status === "PAID"
            ? "bg-amber-50 border-amber-400 text-amber-950"
            : ticketData.payment_status === "REJECTED"
            ? "bg-red-50 border-red-400 text-red-950"
            : "bg-blue-50 border-blue-400 text-blue-950"
        }`}
      >
        <div className="flex items-start space-x-3.5">
          {isVerified ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : ticketData.payment_status === "REJECTED" ? (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h3 className="font-outfit font-black text-base uppercase tracking-tight">
              {isVerified
                ? "ENTRY PASS ISSUED & ACTIVE"
                : ticketData.payment_status === "PAID"
                ? "PAYMENT RECEIVED — VERIFICATION IN PROGRESS"
                : "REGISTRATION UNDER REVIEW"}
            </h3>
            <p className="text-xs sm:text-sm font-sans leading-relaxed">
              {ticketData.guidance_message}
            </p>
          </div>
        </div>
      </div>

      {/* Official Printable 4x4 Entry Pass Card */}
      <div
        id="ticket-print-area"
        className={`bg-white border-2 ${
          isVerified ? "border-amber-600 shadow-xl" : "border-neutral-300 opacity-60"
        } rounded-sm overflow-hidden text-neutral-900 relative print:border-black print:shadow-none`}
      >
        {/* Ticket Top Ribbon */}
        <div className="bg-neutral-950 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <img src="/M-word-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
            <div>
              <span className="font-outfit font-black text-lg tracking-wider text-white leading-none block">
                MADPROTEK ADVENTURE TRAIL 2026
              </span>
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
                SOUTH INDIA OFF-ROAD PROVING GROUND // OFFICIAL ENTRY PASS
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isCheckedIn ? (
              <span className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-mono font-bold tracking-wider uppercase rounded-sm flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CHECKED IN ✓</span>
              </span>
            ) : isVerified ? (
              <span className="px-3 py-1 bg-amber-600 text-white text-[11px] font-mono font-bold tracking-wider uppercase rounded-sm flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ENTRY PASS VERIFIED</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-neutral-800 text-neutral-300 text-[11px] font-mono font-bold tracking-wider uppercase rounded-sm">
                PENDING APPROVAL
              </span>
            )}
          </div>
        </div>

        {/* Ticket Main Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Details Column (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            {/* Slot & Code Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  REGISTRATION CODE
                </span>
                <span className="font-mono text-2xl font-black text-neutral-950 tracking-wider">
                  {ticketData.registration_code}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  ASSIGNED TRAIL SLOT
                </span>
                <span className="inline-block px-3 py-1 bg-neutral-900 text-amber-400 font-outfit text-xl font-black uppercase rounded-sm">
                  {ticketData.slot_number ? `SLOT #${ticketData.slot_number}` : "ENTRY CONFIRMED"}
                </span>
              </div>
            </div>

            {/* Driver & Rig Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">PRIMARY DRIVER</span>
                <span className="font-bold text-neutral-950 text-sm font-sans">{ticketData.driver_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">DRIVER PHONE</span>
                <span className="text-neutral-800">{ticketData.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">MACHINE REG NO</span>
                <span className="font-bold text-neutral-950">{ticketData.vehicle_reg_number || "TN ON RECORD"}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">VEHICLE MODEL</span>
                <span className="text-neutral-800 font-bold">{ticketData.vehicle_model}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">RIG CLASS</span>
                <span className="text-amber-700 font-bold">{ticketData.rig_class}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">CREW / PASSENGERS</span>
                <span className="text-neutral-800 font-bold">
                  {ticketData.passengers && ticketData.passengers.length > 0
                    ? `${ticketData.passengers.length + 1} Persons (Driver + ${ticketData.passengers.map((p: any) => p.name).filter(Boolean).join(", ")})`
                    : "Solo Driver (1 Person)"}
                </span>
              </div>
            </div>

            {/* Event Dates & Location Bar */}
            <div className="bg-sand-100 p-4 rounded-sm border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block font-sans">14–15 NOVEMBER 2026</span>
                  <span className="text-[11px] font-mono text-neutral-600">Reporting Call: 07:00 AM IST</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block font-sans">URIGAM PROVING GROUND</span>
                  <span className="text-[11px] font-mono text-neutral-600">Anchetty Corridor, Krishnagiri / Hosur</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Scan Stub (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-sand-50 border border-neutral-200 rounded-sm text-center">
            {isVerified && ticketData.ticket_qr_code ? (
              <div className="space-y-2">
                <div className="p-2 bg-white rounded border border-neutral-300 shadow-inner inline-block">
                  <img
                    src={ticketData.ticket_qr_code}
                    alt="Ticket QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                  />
                </div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  MARSHAL SCAN VERIFICATION
                </div>
                <div className="text-[10px] font-mono font-bold text-neutral-900 select-all">
                  {ticketData.ticket_qr_token}
                </div>
              </div>
            ) : (
              <div className="py-10 px-4 text-neutral-400 font-mono text-xs">
                <Radio className="w-8 h-8 mx-auto mb-2 text-neutral-300 animate-pulse" />
                <span>QR CODE LOCKED</span>
                <span className="block text-[10px] text-neutral-400 mt-1">
                  Unlocks immediately upon chief marshal verification
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Bottom Security Band */}
        <div className="px-6 py-3 bg-sand-200 border-t border-neutral-300 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-600 gap-2">
          <span>EMERGENCY MARSHAL CHANNEL: 144.200 MHz</span>
          <span>OFFICIAL PROVING GROUND ENTRY PASS</span>
          <span>NON-TRANSFERABLE</span>
        </div>
      </div>

      {/* Action Buttons: Download PDF / Print */}
      {isVerified && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 no-print print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-syne font-bold text-xs tracking-wider uppercase rounded-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE TICKET PASS (PDF)</span>
          </button>

          <a
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 font-syne font-bold text-xs tracking-wider uppercase rounded-sm transition-colors text-center"
          >
            RETURN TO HOME
          </a>
        </div>
      )}
    </div>
  );
}

export default function MyTicketPage() {
  return (
    <main className="min-h-screen bg-sand-50 text-neutral-900 selection:bg-amber-600 selection:text-white flex flex-col justify-between print:min-h-0 print:bg-white print:p-0 print:m-0">
      <div className="no-print print:hidden">
        <Navbar />
      </div>
      <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 print:p-0 print:m-0">
        <Suspense fallback={<div className="text-center font-mono text-xs">Loading Ticket...</div>}>
          <TicketContent />
        </Suspense>
      </div>
      <footer className="py-6 border-t border-neutral-200 text-center text-xs font-mono text-neutral-500 no-print print:hidden">
        © 2026 MADPROTEK ADVENTURE TRAIL • OFFICIAL ENTRY PASS
      </footer>
    </main>
  );
}
