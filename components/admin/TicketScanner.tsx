"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  User,
  Car,
  Calendar,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Clock,
  Radio,
  FileCheck,
} from "lucide-react";

export function TicketScanner({ onCheckedIn }: { onCheckedIn?: () => void } = {}) {
  const [manualCode, setManualCode] = useState("");
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinSuccessMessage, setCheckinSuccessMessage] = useState("");

  const html5QrCodeRef = useRef<any>(null);
  const scannerContainerId = "admin-qr-reader-container";

  const handleVerify = async (tokenOrCode: string) => {
    if (!tokenOrCode || !tokenOrCode.trim()) return;

    setLoadingVerify(true);
    setVerifyError("");
    setCheckinSuccessMessage("");

    try {
      const res = await fetch(`/api/admin/verify-ticket?qr_token=${encodeURIComponent(tokenOrCode.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid or unverified ticket token.");
      }

      setVerifyResult(data.data);
      // Play audible success beep if available
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = data.data.is_checked_in ? 400 : 880;
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => osc.stop(), 200);
      } catch (e) {
        // audio not allowed without user interaction
      }
    } catch (err: any) {
      setVerifyError(err.message || "Failed to verify ticket.");
      setVerifyResult(null);
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleStartCamera = async () => {
    setCameraError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      setIsScanningCamera(true);

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          // Stop camera on successful scan
          try {
            await html5QrCode.stop();
          } catch (e) {}
          setIsScanningCamera(false);
          handleVerify(decodedText);
        },
        (errorMessage: string) => {
          // scanning frame errors (normal while searching)
        }
      );
    } catch (err: any) {
      console.error("Camera scanner start error:", err);
      setCameraError(err.message || "Could not access camera. Please check camera permissions or use manual entry.");
      setIsScanningCamera(false);
    }
  };

  const handleStopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setIsScanningCamera(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleConfirmCheckin = async () => {
    if (!verifyResult?.id) return;

    setCheckingIn(true);
    setCheckinSuccessMessage("");

    try {
      const res = await fetch("/api/admin/verify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: verifyResult.id,
          action: "CHECKIN",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm check-in.");
      }

      setCheckinSuccessMessage(data.message || "CHECKED IN SUCCESSFULLY!");
      // Update local state
      setVerifyResult((prev: any) => ({
        ...prev,
        is_checked_in: true,
        checkin_time: new Date().toISOString(),
      }));
      onCheckedIn?.();
    } catch (err: any) {
      alert(err.message || "Error during check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleResetCheckin = async () => {
    if (!verifyResult?.id) return;
    if (!confirm("Are you sure you want to reset this check-in to NOT CHECKED IN?")) return;

    try {
      const res = await fetch("/api/admin/verify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: verifyResult.id,
          action: "RESET",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckinSuccessMessage("Check-in reset to pending.");
        setVerifyResult((prev: any) => ({
          ...prev,
          is_checked_in: false,
          checkin_time: null,
        }));
      }
    } catch (e: any) {
      alert(e.message || "Reset failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 bg-neutral-900 text-white rounded-sm border border-neutral-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs uppercase tracking-tactical font-bold mb-1">
            <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>STAGING CORRIDOR // GATE ACCESS CONTROL</span>
          </div>
          <h2 className="font-outfit text-2xl font-black uppercase tracking-tight text-white">
            OFFICIAL TICKET QR SCANNER &amp; CHECK-IN
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-1">
            Scan driver tickets upon arrival at Urigam checkpost to verify scrutineering status, payment, and confirm entry wristband allocation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!isScanningCamera ? (
            <button
              onClick={handleStartCamera}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-syne font-bold text-xs tracking-wider uppercase rounded-sm flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>START CAMERA SCANNER</span>
            </button>
          ) : (
            <button
              onClick={handleStopCamera}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-syne font-bold text-xs tracking-wider uppercase rounded-sm flex items-center space-x-2 shadow-sm transition-colors"
            >
              <X className="w-4 h-4" />
              <span>STOP CAMERA</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scanner Box & Manual Search (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Camera Viewport */}
          <div className="bg-white border border-neutral-300 rounded-sm p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-3">
              <span className="text-xs font-mono font-bold uppercase text-neutral-800 flex items-center space-x-1.5">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>CAMERA SCANNER FEED</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isScanningCamera
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {isScanningCamera ? "LIVE SCANNING" : "STANDBY"}
              </span>
            </div>

            {/* html5-qrcode reader element */}
            <div
              id={scannerContainerId}
              className="w-full min-h-[260px] bg-neutral-950 rounded overflow-hidden flex items-center justify-center text-neutral-400 text-xs font-mono border border-neutral-800"
            >
              {!isScanningCamera && (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-10 h-10 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">Camera feed is currently paused.</p>
                  <button
                    onClick={handleStartCamera}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-mono font-bold uppercase"
                  >
                    Open Camera Feed
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Manual Entry Fallback */}
          <div className="bg-white border border-neutral-300 rounded-sm p-4 shadow-sm space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-neutral-800 block">
              MANUAL TICKET SEARCH / SCAN FALLBACK
            </span>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify(manualCode);
                }}
                placeholder="Paste QR Token or Reg Code (e.g. MAT26-0012)"
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono uppercase focus:outline-none focus:border-amber-600"
              />
              <button
                onClick={() => handleVerify(manualCode)}
                disabled={loadingVerify || !manualCode.trim()}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-mono font-bold uppercase disabled:opacity-50 flex items-center space-x-1"
              >
                {loadingVerify ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>VERIFY</span>
              </button>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Tip: Works with handheld barcode/QR gun scanners plugged into USB as well.
            </span>
          </div>
        </div>

        {/* Right Column: Scanned Ticket Verification Result (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {loadingVerify && (
            <div className="bg-white border border-neutral-200 rounded-sm p-12 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="font-mono text-xs font-bold text-neutral-700 uppercase">
                Verifying Ticket Against Proving Ground Database...
              </p>
            </div>
          )}

          {verifyError && (
            <div className="bg-red-50 border-2 border-red-500 rounded-sm p-6 text-red-900 shadow-sm space-y-2">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>INVALID ENTRY PASS // REJECTED</span>
              </div>
              <p className="text-sm font-sans font-medium">{verifyError}</p>
              <p className="text-xs text-neutral-600 font-mono">
                Please ask the driver to show their official registration SMS / email or check the registrations table.
              </p>
            </div>
          )}

          {!loadingVerify && !verifyResult && !verifyError && (
            <div className="bg-white border border-neutral-200 rounded-sm p-12 text-center text-neutral-400 font-mono text-xs shadow-sm space-y-2">
              <QrCode className="w-12 h-12 text-neutral-300 mx-auto" />
              <p className="font-bold uppercase text-neutral-600">NO TICKET CURRENTLY SCANNED</p>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                Aim the camera scanner at a participant&apos;s ticket pass or enter their registration code above to begin check-in.
              </p>
            </div>
          )}

          {verifyResult && (
            <div className="bg-white border-2 border-neutral-300 rounded-sm shadow-md overflow-hidden animate-fadeIn">
              {/* Header Status Strip */}
              <div
                className={`p-4 flex items-center justify-between text-white font-mono text-xs font-bold uppercase ${
                  verifyResult.is_checked_in
                    ? "bg-amber-600"
                    : verifyResult.is_verified
                    ? "bg-emerald-700"
                    : "bg-red-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {verifyResult.is_checked_in ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-white" />
                      <span>ALREADY CHECKED IN AT GATE</span>
                    </>
                  ) : verifyResult.is_verified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>ENTRY PASS VALID &amp; VERIFIED</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-white" />
                      <span>PENDING SCRUTINEERING &amp; PAYMENT</span>
                    </>
                  )}
                </div>

                <div className="px-2 py-0.5 bg-black/40 rounded text-[11px]">
                  {verifyResult.registration_code}
                </div>
              </div>

              {/* Success Notification Banner */}
              {checkinSuccessMessage && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{checkinSuccessMessage}</span>
                </div>
              )}

              {/* Already Checked in Warning */}
              {verifyResult.is_checked_in && (
                <div className="p-4 bg-amber-50 border-b border-amber-300 text-amber-900 text-xs font-mono space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>CHECK-IN TIMESTAMP RECORDED:</span>
                  </div>
                  <p className="text-[11px] text-neutral-700">
                    This ticket pass was checked in on{" "}
                    <strong>
                      {verifyResult.checkin_time
                        ? new Date(verifyResult.checkin_time).toLocaleString("en-IN")
                        : "Earlier today"}
                    </strong>
                    . Duplicate passes should be flagged to Chief Marshal.
                  </p>
                </div>
              )}

              {/* Ticket Holder Particulars */}
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-200 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">LEAD DRIVER</span>
                    <h3 className="font-outfit text-xl font-bold uppercase text-neutral-900">
                      {verifyResult.driver_name}
                    </h3>
                    <span className="text-xs font-mono text-neutral-600">{verifyResult.phone}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">ASSIGNED SLOT</span>
                    <span className="inline-block px-3 py-1 bg-neutral-900 text-amber-400 font-outfit text-xl font-black uppercase rounded">
                      {verifyResult.slot_number ? `SLOT #${verifyResult.slot_number}` : "SLOT ALLOCATED"}
                    </span>
                  </div>
                </div>

                {/* Machine & Class Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs bg-sand-50 p-3.5 rounded border border-neutral-200">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">VEHICLE MACHINE</span>
                    <span className="font-bold text-neutral-900">{verifyResult.vehicle_model}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">REG NUMBER</span>
                    <span className="font-bold text-neutral-900">{verifyResult.vehicle_reg_number || "TN ON RECORD"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">RIG CLASS</span>
                    <span className="font-bold text-amber-700">{verifyResult.rig_class}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">EVENT EXPERIENCE</span>
                    <span className="text-neutral-800">{verifyResult.experience_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">DATE</span>
                    <span className="text-neutral-800">{verifyResult.experience_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">CREW COUNT</span>
                    <span className="text-neutral-800">{verifyResult.passengers_count} Passenger(s)</span>
                  </div>
                </div>

                {/* Payment Audit Summary */}
                <div className="p-3 bg-neutral-50 rounded border border-neutral-200 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>
                      PAYMENT: <strong>₹{(verifyResult.payment_amount || 0).toLocaleString()}</strong> (
                      <span className="text-emerald-700 font-bold">{verifyResult.payment_status || "PAID"}</span>)
                    </span>
                  </div>
                  {verifyResult.payment_utr && (
                    <span className="text-[11px] text-neutral-500">
                      UTR: <strong className="text-neutral-800 select-all">{verifyResult.payment_utr}</strong>
                    </span>
                  )}
                </div>

                {/* Checkin Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {!verifyResult.is_checked_in ? (
                    <button
                      onClick={handleConfirmCheckin}
                      disabled={checkingIn}
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-syne font-bold text-xs tracking-wider uppercase rounded shadow transition-all flex items-center justify-center space-x-2"
                    >
                      {checkingIn ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>RECORDING CHECK-IN...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>CONFIRM CHECK-IN &amp; ISSUE WRISTBAND</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold rounded flex items-center space-x-1.5 border border-emerald-300">
                        <Check className="w-4 h-4" />
                        <span>DRIVER CHECKED IN</span>
                      </span>
                      <button
                        onClick={handleResetCheckin}
                        className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-xs rounded border border-neutral-300"
                      >
                        Reset Status
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setVerifyResult(null);
                      setManualCode("");
                      setCheckinSuccessMessage("");
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-mono text-xs font-bold uppercase rounded transition-colors text-center"
                  >
                    Scan Next Ticket →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketScanner;
