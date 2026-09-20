"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Phone,
  MessageSquare,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Car,
  ExternalLink,
  Database,
  Radio,
  FileText,
  Trash2,
  Edit3,
  X,
  RefreshCw,
  Lock,
  LogOut,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { RegistrationRecord } from "@/lib/db";

const STATUS_CONFIG: Record<
  RegistrationRecord["status"],
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING_CALL: {
    label: "CALL PENDING",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  CALLED_FOLLOW_UP: {
    label: "FOLLOW-UP NEEDED",
    color: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
  SCRUTINEERING_REVIEW: {
    label: "SCRUTINEERING REVIEW",
    color: "text-purple-800",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
  SLOT_CONFIRMED: {
    label: "SLOT CONFIRMED",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-400",
  },
  WAITLISTED: {
    label: "WAITLISTED",
    color: "text-neutral-700",
    bg: "bg-neutral-100",
    border: "border-neutral-300",
  },
  CANCELLED: {
    label: "CANCELLED",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");

  // Settings & DB State
  const [settings, setSettings] = useState<{
    online_registration_open: boolean;
    max_slots: number;
    mysql_connected: boolean;
    database_host: string;
    database_name: string;
  }>({
    online_registration_open: false,
    max_slots: 30,
    mysql_connected: false,
    database_host: "localhost",
    database_name: "madprotek_offroad",
  });
  const [isTogglingSetting, setIsTogglingSetting] = useState(false);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegistrationRecord | null>(null);
  const [activeNoteModalRecord, setActiveNoteModalRecord] = useState<RegistrationRecord | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  // Form State for Manual Phone Entry
  const [formData, setFormData] = useState({
    driver_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    vehicle_model: "",
    rig_class: "Extreme Class (35\"+ Lockers)",
    modifications: "",
    experience_years: "3-5 Years",
    spotter_name: "",
    spotter_phone: "",
    status: "PENDING_CALL" as RegistrationRecord["status"],
    call_notes: "",
    slot_number: "",
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMounted, setAuthMounted] = useState(false);
  const [usernameInput, setUsernameInput] = useState("admin");
  const [passwordInput, setPasswordInput] = useState("madprotek2026");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const isAuth = sessionStorage.getItem("madprotek_admin_auth") === "true";
    setIsAuthenticated(isAuth);
    setAuthMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (u === "admin" && p === "madprotek2026") {
      sessionStorage.setItem("madprotek_admin_auth", "true");
      setIsAuthenticated(true);
    } else {
      setAuthError("Invalid credentials. Please verify your username and password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("madprotek_admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }, []);

  // Fetch Registrations
  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (classFilter !== "ALL") params.set("rigClass", classFilter);

      const res = await fetch(`/api/registrations?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRegistrations(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, classFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, fetchSettings]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated, fetchRegistrations]);

  // Toggle Online Registration Mode
  const handleToggleOnlineRegistration = async () => {
    try {
      setIsTogglingSetting(true);
      const nextVal = !settings.online_registration_open;
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online_registration_open: nextVal }),
      });
      const json = await res.json();
      if (json.success) {
        setSettings((prev) => ({ ...prev, online_registration_open: nextVal }));
      }
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setIsTogglingSetting(false);
    }
  };

  // Quick Status Update
  const handleStatusChange = async (id: number, newStatus: RegistrationRecord["status"]) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Save / Append Call Note
  const handleSaveNote = async () => {
    if (!activeNoteModalRecord || !newNoteText.trim()) return;
    const now = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const appendedNote = activeNoteModalRecord.call_notes
      ? `${activeNoteModalRecord.call_notes}\n[${now}] ${newNoteText.trim()}`
      : `[${now}] ${newNoteText.trim()}`;

    try {
      const res = await fetch(`/api/registrations/${activeNoteModalRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_notes: appendedNote }),
      });
      const json = await res.json();
      if (json.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === activeNoteModalRecord.id ? { ...r, call_notes: appendedNote } : r))
        );
        setActiveNoteModalRecord(null);
        setNewNoteText("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  // Submit Manual Registration
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingForm(true);
      const payload = {
        ...formData,
        slot_number: formData.slot_number ? Number(formData.slot_number) : null,
        source: "PHONE_MANUAL",
      };

      if (editingRecord) {
        const res = await fetch(`/api/registrations/${editingRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setRegistrations((prev) =>
            prev.map((r) => (r.id === editingRecord.id ? json.data : r))
          );
          setIsRegisterModalOpen(false);
          setEditingRecord(null);
        }
      } else {
        const res = await fetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setRegistrations((prev) => [json.data, ...prev]);
          setIsRegisterModalOpen(false);
          setFormData({
            driver_name: "",
            phone: "",
            whatsapp: "",
            email: "",
            vehicle_model: "",
            rig_class: "Extreme Class (35\"+ Lockers)",
            modifications: "",
            experience_years: "3-5 Years",
            spotter_name: "",
            spotter_phone: "",
            status: "PENDING_CALL",
            call_notes: "",
            slot_number: "",
          });
        }
      }
    } catch (err) {
      console.error("Form submit error:", err);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Delete Registration
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this registration entry?")) return;
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Open Edit Modal
  const openEditModal = (rec: RegistrationRecord) => {
    setEditingRecord(rec);
    setFormData({
      driver_name: rec.driver_name,
      phone: rec.phone,
      whatsapp: rec.whatsapp || "",
      email: rec.email || "",
      vehicle_model: rec.vehicle_model,
      rig_class: rec.rig_class,
      modifications: rec.modifications || "",
      experience_years: rec.experience_years || "3-5 Years",
      spotter_name: rec.spotter_name || "",
      spotter_phone: rec.spotter_phone || "",
      status: rec.status,
      call_notes: rec.call_notes || "",
      slot_number: rec.slot_number ? String(rec.slot_number) : "",
    });
    setIsRegisterModalOpen(true);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Slot #",
      "Driver Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Vehicle Model",
      "Rig Class",
      "Modifications",
      "Spotter Name",
      "Spotter Phone",
      "Status",
      "Call Notes",
      "Registered At",
    ];

    const rows = registrations.map((r) => [
      r.slot_number ? `Slot ${r.slot_number}` : "Waitlist",
      `"${r.driver_name}"`,
      `"${r.phone}"`,
      `"${r.whatsapp || ""}"`,
      `"${r.email || ""}"`,
      `"${r.vehicle_model}"`,
      `"${r.rig_class}"`,
      `"${(r.modifications || "").replace(/"/g, '""')}"`,
      `"${r.spotter_name || ""}"`,
      `"${r.spotter_phone || ""}"`,
      r.status,
      `"${(r.call_notes || "").replace(/"/g, '""')}"`,
      r.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `madprotek_rig_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Telemetry Calculations
  const confirmedCount = registrations.filter((r) => r.status === "SLOT_CONFIRMED").length;
  const pendingCallsCount = registrations.filter(
    (r) => r.status === "PENDING_CALL" || r.status === "CALLED_FOLLOW_UP"
  ).length;
  const reviewCount = registrations.filter((r) => r.status === "SCRUTINEERING_REVIEW").length;
  const slotsRemaining = Math.max(0, settings.max_slots - confirmedCount);

  // If still checking auth state, render loading placeholder
  if (!authMounted) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-neutral-600 font-mono text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
          <span>VERIFYING MARSHAL DISPATCH CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render Tactical Access Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between py-12 px-6 selection:bg-amber-600 selection:text-white relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto my-auto relative z-10">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-neutral-900 border border-neutral-800 rounded-lg mb-4 shadow-xl">
              <img
                src="/M-word-logo.png"
                alt="MadProTek"
                className="h-12 w-auto object-contain"
              />
            </div>
            <h1 className="font-outfit text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              MADPROTEK CONSOLE
            </h1>
            <div className="flex items-center justify-center space-x-2 text-amber-500 font-mono text-xs tracking-tactical uppercase font-bold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MARSHAL DISPATCH ACCESS GATE</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-sm p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-5">
              {authError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded text-red-300 text-xs font-mono">
                  {authError}
                </div>
              )}

              <div>
                <label className="block font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2 font-semibold">
                  DISPATCH CALLSIGN / USERNAME
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:outline-none text-white font-mono text-sm rounded-sm transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2 font-semibold">
                  SECURITY CLEARANCE KEY
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:outline-none text-white font-mono text-sm rounded-sm transition-colors pr-10"
                  />
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-black text-xs sm:text-sm tracking-wider uppercase rounded-sm shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>UNLOCK COMMAND CONSOLE</span>
              </button>
            </form>

            {/* Credential Helper Box */}
            <div className="mt-6 pt-6 border-t border-neutral-800/80">
              <div className="bg-neutral-950/80 border border-neutral-800/60 p-3.5 rounded-sm">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-tactical font-semibold mb-1.5 flex items-center justify-between">
                  <span>DISPATCH CREDENTIALS</span>
                  <span className="text-amber-500">AUTHORIZED ONLY</span>
                </div>
                <div className="font-mono text-xs text-neutral-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Username:</span>
                    <span className="text-amber-400 font-bold">admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Password:</span>
                    <span className="text-amber-400 font-bold">madprotek2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer return link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-xs font-mono text-neutral-500 hover:text-amber-500 uppercase tracking-widest transition-colors inline-flex items-center space-x-1"
            >
              <span>← RETURN TO PUBLIC TRAIL SITE</span>
            </Link>
          </div>
        </div>

        <div className="text-center text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
          OFFICIAL PROVING GROUND SCRUTINEERING & TELEMETRY // CONFIDENTIAL
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-neutral-900 font-sans pb-24 selection:bg-amber-600 selection:text-white">
      {/* Top Tactical Command Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/M-word-logo.png"
                alt="MadProTek"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-outfit font-black text-lg sm:text-xl tracking-wider text-neutral-950 uppercase leading-none">
                  MADPROTEK
                </span>
                <span className="text-[10px] font-mono tracking-tactical text-amber-700 uppercase font-bold mt-0.5">
                  COMMAND CONSOLE // INTAKE & SCRUTINEERING
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Database Indicator */}
            <div
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-sm border text-xs font-mono font-semibold ${
                settings.mysql_connected
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-amber-50 border-amber-300 text-amber-800"
              }`}
              title={
                settings.mysql_connected
                  ? `Connected to MySQL [${settings.database_name}] on ${settings.database_host}`
                  : "Running in local resilient cache mode. Ready to sync with MySQL."
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {settings.mysql_connected
                  ? "MYSQL: CONNECTED"
                  : "MYSQL: STANDBY (RESILIENT CACHE)"}
              </span>
            </div>

            {/* Back to Site */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-sm text-xs font-mono font-bold uppercase transition-colors"
            >
              <span>VIEW TRAIL SITE</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Logout / Lock Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-sm text-xs font-mono font-bold uppercase transition-colors"
              title="Lock Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOCK</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-8">
        {/* Registration Mode & Operational Status Banner */}
        <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase font-bold mb-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>MARSHAL INFLOW CONTROLLER</span>
            </div>
            <h2 className="font-outfit text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950">
              {settings.online_registration_open
                ? "ONLINE PUBLIC REGISTRATION: OPEN"
                : "PHONE INTAKE STAGE: ACTIVE (ONLINE REGISTRATION OPENING SHORTLY)"}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium">
              {settings.online_registration_open
                ? "Public drivers can directly submit applications through the web form into the database."
                : "Organizers are currently receiving calls, logging driver details manually, and reserving slots before opening public form."}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleOnlineRegistration}
              disabled={isTogglingSetting}
              className={`px-5 py-2.5 rounded-sm font-outfit font-extrabold text-xs tracking-wider uppercase transition-all flex items-center space-x-2 shadow-sm ${
                settings.online_registration_open
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {isTogglingSetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {settings.online_registration_open
                  ? "SWITCH TO PHONE INTAKE ONLY"
                  : "OPEN PUBLIC ONLINE REGISTRATION"}
              </span>
            </button>
          </div>
        </div>

        {/* Tactical Key Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Confirmed Slots Meter */}
          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono tracking-wider text-amber-700 uppercase font-bold">
                SLOT QUOTA
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase rounded-sm">
                CAP: 30 RIGS
              </span>
            </div>
            <div>
              <div className="font-outfit text-3xl sm:text-4xl font-black text-neutral-950 mb-1">
                {confirmedCount}{" "}
                <span className="text-lg text-neutral-400 font-normal">/ {settings.max_slots}</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((confirmedCount / settings.max_slots) * 100, 100)}%` }}
                />
              </div>
              <p className="font-sans text-xs text-neutral-500 font-medium">
                {slotsRemaining} competition rig slots available
              </p>
            </div>
          </div>

          {/* Pending Phone Calls */}
          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono tracking-wider text-amber-700 uppercase font-bold">
                PHONE ACTION QUEUE
              </span>
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-sm">
                <Phone className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="font-outfit text-3xl sm:text-4xl font-black text-amber-700 mb-1">
                {pendingCallsCount}
              </div>
              <p className="font-sans text-xs text-neutral-600 font-medium">
                Drivers awaiting phone call or callback follow-up
              </p>
            </div>
          </div>

          {/* Under Scrutineering */}
          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono tracking-wider text-amber-700 uppercase font-bold">
                SCRUTINEERING
              </span>
              <div className="p-1.5 bg-purple-100 text-purple-800 rounded-sm">
                <Car className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="font-outfit text-3xl sm:text-4xl font-black text-purple-900 mb-1">
                {reviewCount}
              </div>
              <p className="font-sans text-xs text-neutral-600 font-medium">
                Rigs under mechanical spec review (lockers/cage/tires)
              </p>
            </div>
          </div>

          {/* Total Inflow */}
          <div className="p-6 bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono tracking-wider text-amber-700 uppercase font-bold">
                TOTAL INFLOW
              </span>
              <div className="p-1.5 bg-neutral-100 text-neutral-800 rounded-sm">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="font-outfit text-3xl sm:text-4xl font-black text-neutral-900 mb-1">
                {registrations.length}
              </div>
              <p className="font-sans text-xs text-neutral-500 font-medium">
                Total registrations recorded in system
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search driver, phone, vehicle model..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-sm text-xs font-sans text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-600 transition-colors shadow-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-neutral-300 rounded-sm text-xs font-mono text-neutral-800 focus:outline-none focus:border-amber-600 shadow-sm"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="PENDING_CALL">CALL PENDING</option>
              <option value="CALLED_FOLLOW_UP">FOLLOW-UP NEEDED</option>
              <option value="SCRUTINEERING_REVIEW">SCRUTINEERING REVIEW</option>
              <option value="SLOT_CONFIRMED">SLOT CONFIRMED</option>
              <option value="WAITLISTED">WAITLISTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-neutral-300 rounded-sm text-xs font-mono text-neutral-800 focus:outline-none focus:border-amber-600 shadow-sm"
            >
              <option value="ALL">ALL RIG CLASSES</option>
              <option value="Extreme Class (35&quot;+ Lockers)">EXTREME CLASS (35&quot;+)</option>
              <option value="Pro-Modified (33&quot;–35&quot;)">PRO-MODIFIED (33&quot;-35&quot;)</option>
            </select>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={exportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-sm text-xs font-mono font-bold text-neutral-800 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              <span>EXPORT CSV</span>
            </button>

            {/* REGISTER RIG MANUAL BUTTON */}
            <button
              onClick={() => {
                setEditingRecord(null);
                setFormData({
                  driver_name: "",
                  phone: "",
                  whatsapp: "",
                  email: "",
                  vehicle_model: "",
                  rig_class: "Extreme Class (35\"+ Lockers)",
                  modifications: "",
                  experience_years: "3-5 Years",
                  spotter_name: "",
                  spotter_phone: "",
                  status: "PENDING_CALL",
                  call_notes: "",
                  slot_number: "",
                });
                setIsRegisterModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-sm font-outfit font-extrabold text-xs tracking-wider uppercase shadow-sm transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>+ REGISTER RIG (PHONE INFLOW)</span>
            </button>
          </div>
        </div>

        {/* Registrations Data Table */}
        <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
                LOADING REGISTRATION TELEMETRY...
              </p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Car className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="font-outfit text-lg font-bold text-neutral-800 uppercase">
                NO REGISTRATION ENTRIES FOUND
              </h3>
              <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6 font-medium">
                No matching drivers found for the selected filters. Use the button above to log a new phone call registration.
              </p>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-5 py-2.5 bg-amber-600 text-white text-xs font-outfit font-bold uppercase tracking-wider rounded-sm shadow-sm"
              >
                + REGISTER NEW RIG
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-sand-100 text-[11px] font-mono text-neutral-700 tracking-wider uppercase">
                    <th className="py-3.5 px-4 font-bold">SLOT #</th>
                    <th className="py-3.5 px-4 font-bold">DRIVER & CONTACT</th>
                    <th className="py-3.5 px-4 font-bold">VEHICLE & SPECS</th>
                    <th className="py-3.5 px-4 font-bold">SPOTTER</th>
                    <th className="py-3.5 px-4 font-bold">STATUS</th>
                    <th className="py-3.5 px-4 font-bold">CALL NOTES</th>
                    <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs">
                  {registrations.map((rec) => {
                    const statusStyle = STATUS_CONFIG[rec.status] || STATUS_CONFIG.PENDING_CALL;

                    return (
                      <tr
                        key={rec.id}
                        className="hover:bg-sand-50 transition-colors group"
                      >
                        {/* Slot Number */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {rec.slot_number ? (
                            <div className="inline-flex items-center px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-sm font-mono font-bold text-xs">
                              SLOT #{rec.slot_number.toString().padStart(2, "0")}
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-2 py-1 bg-neutral-100 border border-neutral-200 text-neutral-500 rounded-sm font-mono text-[10px]">
                              UNASSIGNED
                            </div>
                          )}
                        </td>

                        {/* Driver & Contact */}
                        <td className="py-4 px-4 min-w-[200px]">
                          <div className="font-outfit font-bold text-sm text-neutral-950">
                            {rec.driver_name}
                          </div>
                          <div className="flex items-center space-x-3 mt-1 text-xs">
                            <a
                              href={`tel:${rec.phone}`}
                              className="inline-flex items-center space-x-1 text-amber-700 hover:text-amber-800 hover:underline font-mono"
                              title="Call Driver"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{rec.phone}</span>
                            </a>
                            {rec.whatsapp && (
                              <a
                                href={`https://wa.me/${rec.whatsapp.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 hover:underline font-mono"
                                title="Open WhatsApp Chat"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                          {rec.email && (
                            <div className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate max-w-[200px]">
                              {rec.email}
                            </div>
                          )}
                        </td>

                        {/* Vehicle & Specs */}
                        <td className="py-4 px-4 min-w-[220px]">
                          <div className="font-outfit font-semibold text-neutral-900">
                            {rec.vehicle_model}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono text-[10px] rounded-sm font-semibold">
                            {rec.rig_class}
                          </span>
                          {rec.modifications && (
                            <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2 max-w-xs font-sans">
                              {rec.modifications}
                            </p>
                          )}
                        </td>

                        {/* Spotter */}
                        <td className="py-4 px-4 min-w-[140px] font-sans">
                          {rec.spotter_name ? (
                            <>
                              <div className="font-semibold text-neutral-800">
                                {rec.spotter_name}
                              </div>
                              {rec.spotter_phone && (
                                <a
                                  href={`tel:${rec.spotter_phone}`}
                                  className="text-[11px] text-neutral-500 hover:text-amber-700 font-mono block mt-0.5"
                                >
                                  {rec.spotter_phone}
                                </a>
                              )}
                            </>
                          ) : (
                            <span className="text-neutral-400 font-mono text-[11px] italic">
                              None listed
                            </span>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            value={rec.status}
                            onChange={(e) =>
                              handleStatusChange(
                                rec.id,
                                e.target.value as RegistrationRecord["status"]
                              )
                            }
                            className={`px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold border focus:outline-none ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                          >
                            <option value="PENDING_CALL">CALL PENDING</option>
                            <option value="CALLED_FOLLOW_UP">FOLLOW-UP NEEDED</option>
                            <option value="SCRUTINEERING_REVIEW">SCRUTINEERING REVIEW</option>
                            <option value="SLOT_CONFIRMED">SLOT CONFIRMED</option>
                            <option value="WAITLISTED">WAITLISTED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        {/* Call Notes & Quick Log */}
                        <td className="py-4 px-4 min-w-[200px]">
                          {rec.call_notes ? (
                            <div
                              onClick={() => {
                                setActiveNoteModalRecord(rec);
                                setNewNoteText("");
                              }}
                              className="text-[11px] text-neutral-700 bg-sand-100 p-2 rounded border border-neutral-200 cursor-pointer hover:border-amber-600 transition-colors line-clamp-2 max-w-xs font-mono"
                              title="Click to view full notes or append new entry"
                            >
                              {rec.call_notes}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveNoteModalRecord(rec);
                                setNewNoteText("");
                              }}
                              className="inline-flex items-center space-x-1 text-[11px] font-mono text-amber-700 hover:text-amber-800 font-semibold"
                            >
                              <Plus className="w-3 h-3" />
                              <span>ADD NOTE</span>
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(rec)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 rounded transition-colors"
                              title="Edit Rig Entry"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rec.id)}
                              className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-700 rounded transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: MANUAL PHONE REGISTRATION / EDIT MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-2xl w-full max-w-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-sand-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-600 text-white rounded-sm shadow-sm">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-lg uppercase tracking-tight text-neutral-950">
                    {editingRecord ? "EDIT RIG APPLICATION" : "LOG PHONE REGISTRATION INTAKE"}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                    {editingRecord
                      ? "UPDATE DETAILS & SCRUTINEERING"
                      : "ACTIVE PHONE CALL // DIRECT ENTRY TO DATABASE"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
              {/* Row 1: Driver Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    DRIVER FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.driver_name}
                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                    placeholder="e.g. Vikram Rathore"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    PRIMARY PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Row 2: WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    WHATSAPP NUMBER
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="For scrutineering checklists"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="driver@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Row 3: Vehicle & Rig Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    VEHICLE MODEL & ENGINE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    placeholder="e.g. Mahindra Thar, Gurkha, Gypsy"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    RIG CLASS
                  </label>
                  <select
                    value={formData.rig_class}
                    onChange={(e) => setFormData({ ...formData, rig_class: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600 font-mono"
                  >
                    <option>Extreme Class (35&quot;+ Lockers)</option>
                    <option>Pro-Modified (33&quot;–35&quot;)</option>
                    <option>Standard Proving Spec (31&quot;-33&quot;)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Modifications & Armor */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  RIG MODIFICATIONS (TIRES, LOCKERS, WINCH, CAGE)
                </label>
                <input
                  type="text"
                  value={formData.modifications}
                  onChange={(e) => setFormData({ ...formData, modifications: e.target.value })}
                  placeholder="e.g. 35-inch Maxxis, Dual ARB Air Lockers, 12K Winch, Rollcage"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Row 5: Spotter Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    CO-DRIVER / SPOTTER NAME
                  </label>
                  <input
                    type="text"
                    value={formData.spotter_name}
                    onChange={(e) => setFormData({ ...formData, spotter_name: e.target.value })}
                    placeholder="Spotter Name"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    SPOTTER PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    value={formData.spotter_phone}
                    onChange={(e) => setFormData({ ...formData, spotter_phone: e.target.value })}
                    placeholder="+91 Phone"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Row 6: Slot Number & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    ASSIGN SLOT NUMBER (1 TO 30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.slot_number}
                    onChange={(e) => setFormData({ ...formData, slot_number: e.target.value })}
                    placeholder="Leave empty for waitlist"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    APPLICATION STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as RegistrationRecord["status"] })
                    }
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs font-mono font-bold focus:outline-none focus:border-amber-600"
                  >
                    <option value="PENDING_CALL">CALL PENDING</option>
                    <option value="CALLED_FOLLOW_UP">FOLLOW-UP NEEDED</option>
                    <option value="SCRUTINEERING_REVIEW">SCRUTINEERING REVIEW</option>
                    <option value="SLOT_CONFIRMED">SLOT CONFIRMED</option>
                    <option value="WAITLISTED">WAITLISTED</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Call Notes */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  CALL LOG & MARSHAL NOTES
                </label>
                <textarea
                  rows={3}
                  value={formData.call_notes}
                  onChange={(e) => setFormData({ ...formData, call_notes: e.target.value })}
                  placeholder="e.g. Called driver at 11:30 AM. Discussed recovery gear. Driver will send WhatsApp photo of tire sidewalls."
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-neutral-300 rounded-sm text-xs focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-100 rounded-sm text-xs font-mono font-bold uppercase text-neutral-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-sm font-outfit font-black text-xs uppercase tracking-wider shadow-sm flex items-center space-x-2"
                >
                  {submittingForm && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingRecord ? "UPDATE RIG RECORD" : "SAVE PHONE REGISTRATION"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CALL NOTES LOGGER */}
      {activeNoteModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-sand-100">
              <div>
                <h3 className="font-outfit font-bold text-base uppercase text-neutral-950">
                  LOG CALL NOTE: {activeNoteModalRecord.driver_name}
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  {activeNoteModalRecord.vehicle_model} // {activeNoteModalRecord.phone}
                </span>
              </div>
              <button
                onClick={() => setActiveNoteModalRecord(null)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeNoteModalRecord.call_notes && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block mb-1">
                    PREVIOUS CALL HISTORY:
                  </span>
                  <div className="p-3 bg-sand-50 border border-neutral-200 rounded text-xs font-mono text-neutral-800 whitespace-pre-line max-h-40 overflow-y-auto">
                    {activeNoteModalRecord.call_notes}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  NEW CALL LOG ENTRY:
                </label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="e.g. Called driver regarding payment and scrutineering schedule..."
                  className="w-full p-3 bg-white border border-neutral-300 rounded-sm text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveNoteModalRecord(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-sm text-xs font-mono text-neutral-700"
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-sm text-xs font-outfit font-bold uppercase tracking-wider shadow-sm"
                >
                  APPEND NOTE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
