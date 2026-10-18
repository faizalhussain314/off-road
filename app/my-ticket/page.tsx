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
    <div className="max-w-3xl w-full mx-auto space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between no-print">
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

      {/* Verification In Progress Banner (if NOT yet verified by admin) */}
      {!isVerified ? (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-sm p-6 sm:p-8 text-neutral-900 shadow-sm no-print">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-200/80 rounded-full text-amber-900 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-mono font-bold tracking-wider uppercase rounded">
                <span>STAGE: SCRUTINEERING & PAYMENT VERIFICATION</span>
              </div>
              <h2 className="font-outfit text-2xl font-black uppercase tracking-tight text-neutral-950">
                REGISTRATION RECEIVED — UNDER MARSHAL REVIEW
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Thank you for submitting your 4x4 machine details and UPI payment confirmation. Our event marshals are currently verifying your uploaded vehicle documents and payment screenshot.
              </p>

              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 font-sans">
                <strong>WhatsApp Notification:</strong> Once payment gets verified you will get notification via WhatsApp on{" "}
                <span className="font-mono font-bold text-emerald-800">{ticketData.whatsapp || ticketData.phone}</span>. Your scannable QR ticket pass will unlock automatically.
              </div>

              <div className="pt-3 border-t border-amber-300/60 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Reg Code</span>
                  <span className="font-bold text-neutral-900">{ticketData.registration_code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">UPI UTR Ref</span>
                  <span className="font-bold text-neutral-900 truncate block">
                    {ticketData.payment_utr || "Submitted Screenshot"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">WhatsApp</span>
                  <span className="font-bold text-emerald-700">{ticketData.whatsapp || ticketData.phone}</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-neutral-600 font-sans">
                💡 <em>Once our Chief Marshal verifies your entry, your official scannable QR pass and slot number will activate here and be sent directly to your WhatsApp.</em>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
                  {ticketData.slot_number ? `SLOT #${ticketData.slot_number}` : "SLOT CONFIRMED"}
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
                <span className="text-neutral-800">
                  {ticketData.passengers && ticketData.passengers.length > 0
                    ? `${ticketData.passengers.length} Crew Member(s)`
                    : "Solo Driver"}
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 no-print">
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
    <main className="min-h-screen bg-sand-50 text-neutral-900 selection:bg-amber-600 selection:text-white flex flex-col justify-between">
      <div className="no-print">
        <Navbar />
      </div>
      <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <Suspense fallback={<div className="text-center font-mono text-xs">Loading Ticket...</div>}>
          <TicketContent />
        </Suspense>
      </div>
      <footer className="py-6 border-t border-neutral-200 text-center text-xs font-mono text-neutral-500 no-print">
        © 2026 MADPROTEK ADVENTURE TRAIL • OFFICIAL ENTRY PASS
      </footer>
    </main>
  );
}
