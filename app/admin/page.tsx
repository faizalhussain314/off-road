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
  Building2,
  Briefcase,
  FileSpreadsheet,
  Layers,
  Settings,
  Eye,
  Check,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { RegistrationRecord, SponsorInquiryRecord } from "@/lib/db";

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

const SPONSOR_STATUS_CONFIG: Record<
  SponsorInquiryRecord["status"],
  { label: string; color: string; bg: string; border: string }
> = {
  NEW: {
    label: "NEW INQUIRY",
    color: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
  CONTACTED: {
    label: "CONTACTED",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  INVOICE_SENT: {
    label: "INVOICE DISPATCHED",
    color: "text-purple-800",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
  CONFIRMED: {
    label: "PARTNERSHIP CONFIRMED",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-400",
  },
  DECLINED: {
    label: "DECLINED",
    color: "text-neutral-600",
    bg: "bg-neutral-100",
    border: "border-neutral-300",
  },
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"registrations" | "sponsors" | "settings">("registrations");

  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");

  // Sponsor Inquiries state
  const [sponsors, setSponsors] = useState<SponsorInquiryRecord[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [sponsorTierFilter, setSponsorTierFilter] = useState("ALL");
  const [sponsorStatusFilter, setSponsorStatusFilter] = useState("ALL");

  // Settings & DB State
  const [settings, setSettings] = useState<{
    online_registration_open: boolean;
    max_slots: number;
    mysql_connected: boolean;
    database_host: string;
    database_name: string;
  }>({
    online_registration_open: true,
    max_slots: 50,
    mysql_connected: false,
    database_host: "localhost",
    database_name: "madprotek_offroad",
  });
  const [isTogglingSetting, setIsTogglingSetting] = useState(false);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegistrationRecord | null>(null);
  const [dossierRecord, setDossierRecord] = useState<RegistrationRecord | null>(null);
  const [sponsorModalRecord, setSponsorModalRecord] = useState<SponsorInquiryRecord | null>(null);
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
      setLoadingRegistrations(true);
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
      setLoadingRegistrations(false);
    }
  }, [searchTerm, statusFilter, classFilter]);

  // Fetch Sponsors
  const fetchSponsors = useCallback(async () => {
    try {
      setLoadingSponsors(true);
      const res = await fetch("/api/sponsors");
      const json = await res.json();
      if (json.success) {
        setSponsors(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch sponsors:", err);
    } finally {
      setLoadingSponsors(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      fetchRegistrations();
      fetchSponsors();
    }
  }, [isAuthenticated, fetchSettings, fetchRegistrations, fetchSponsors]);

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

  // Quick Status Update for Registrations
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

  // Quick Status Update for Sponsors
  const handleSponsorStatusChange = async (id: number, newStatus: SponsorInquiryRecord["status"]) => {
    try {
      const res = await fetch(`/api/sponsors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setSponsors((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      console.error("Failed to update sponsor status:", err);
    }
  };

  // Delete Sponsor
  const handleDeleteSponsor = async (id: number) => {
    if (!confirm("Are you sure you want to remove this sponsor inquiry?")) return;
    try {
      const res = await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSponsors((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Delete sponsor error:", err);
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
      rig_class: rec.rig_class || "Extreme Class (35\"+ Lockers)",
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

  // Export CSV for Registrations
  const exportRegistrationsCSV = () => {
    if (registrations.length === 0) return;
    const headers = [
      "ID",
      "REGISTRATION_CODE",
      "SLOT_NUMBER",
      "EXPERIENCE",
      "AMOUNT",
      "DRIVER_NAME",
      "PHONE",
      "WHATSAPP",
      "EMAIL",
      "VEHICLE",
      "RIG_CLASS",
      "CREW_COUNT",
      "STATUS",
      "CREATED_AT",
    ];

    const rows = registrations.map((r) => [
      r.id,
      r.registration_code || `MAT26-${String(r.id).padStart(4, "0")}`,
      r.slot_number || "UNASSIGNED",
      `"${r.experience_type || "OWN 4X4 EXPERIENCE"}"`,
      r.total_amount || 6999,
      `"${r.driver_name}"`,
      `"${r.phone}"`,
      `"${r.whatsapp || ""}"`,
      `"${r.email || ""}"`,
      `"${r.vehicle_model}"`,
      `"${r.rig_class}"`,
      (r.passengers?.length || 0) + 1,
      r.status,
      r.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `madprotek_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Sponsors
  const exportSponsorsCSV = () => {
    if (sponsors.length === 0) return;
    const headers = [
      "ID",
      "COMPANY_NAME",
      "CONTACT_PERSON",
      "EMAIL",
      "PHONE",
      "TIER_INTEREST",
      "REQUEST_TYPE",
      "GST_NUMBER",
      "STATUS",
      "CREATED_AT",
    ];

    const rows = sponsors.map((s) => [
      s.id,
      `"${s.company_name}"`,
      `"${s.contact_person}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.tier_interest}"`,
      `"${s.request_type}"`,
      `"${s.gst_number || ""}"`,
      s.status,
      s.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `madprotek_sponsors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered sponsors
  const filteredSponsors = sponsors.filter((s) => {
    if (sponsorTierFilter !== "ALL" && !s.tier_interest.includes(sponsorTierFilter)) return false;
    if (sponsorStatusFilter !== "ALL" && s.status !== sponsorStatusFilter) return false;
    if (sponsorSearch) {
      const q = sponsorSearch.toLowerCase();
      return (
        s.company_name.toLowerCase().includes(q) ||
        s.contact_person.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.gst_number && s.gst_number.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Telemetry Metrics
  const confirmedCount = registrations.filter((r) => r.status === "SLOT_CONFIRMED").length;
  const pendingCallsCount = registrations.filter((r) => r.status === "PENDING_CALL" || r.status === "CALLED_FOLLOW_UP").length;
  const reviewCount = registrations.filter((r) => r.status === "SCRUTINEERING_REVIEW").length;
  const slotsRemaining = Math.max(0, settings.max_slots - confirmedCount);

  const sponsorInvoicesCount = sponsors.filter((s) => s.request_type === "REQUEST_INVOICE").length;
  const sponsorConfirmedCount = sponsors.filter((s) => s.status === "CONFIRMED").length;

  if (!authMounted) return null;

  // Unauthenticated Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-amber-600 selection:text-white">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg p-8 shadow-2xl mb-6">
          <div className="text-center mb-8">
            <img src="/M-word-logo.png" alt="MadProTek" className="h-12 w-auto mx-auto mb-3 object-contain" />
            <h1 className="font-outfit font-black text-2xl tracking-wider text-white uppercase">
              MADPROTEK DISPATCH
            </h1>
            <p className="font-mono text-xs text-amber-500 uppercase tracking-widest mt-1">
              ADMIN COMMAND & SCRUTINEERING CONSOLE
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3 bg-red-950/80 border border-red-700/60 rounded text-red-300 text-xs font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">Username</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-bold uppercase tracking-wider rounded transition-colors text-sm"
            >
              Unlock Command Console
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800 text-xs font-mono text-neutral-400 flex justify-between">
            <span>Username: <strong className="text-amber-400">admin</strong></span>
            <span>Password: <strong className="text-amber-400">madprotek2026</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-neutral-900 font-sans pb-24 selection:bg-amber-600 selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/M-word-logo.png" alt="MadProTek" className="h-9 w-auto object-contain" />
              <div>
                <span className="font-outfit font-black text-lg sm:text-xl tracking-wider text-neutral-950 uppercase leading-none block">
                  MADPROTEK
                </span>
                <span className="text-[10px] font-mono tracking-tactical text-amber-700 uppercase font-bold">
                  COMMAND CONSOLE // 4X4 ADVENTURE TRAIL 2026
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-sm border text-xs font-mono font-semibold bg-emerald-50 border-emerald-300 text-emerald-800">
              <Database className="w-3.5 h-3.5" />
              <span>LIVE DATABASE STORE: ACTIVE</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-sm text-xs font-mono font-bold uppercase"
            >
              <span>VIEW TRAIL SITE</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-sm text-xs font-mono font-bold uppercase"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOCK</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-neutral-300 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("registrations")}
            className={`px-5 py-3 font-outfit font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === "registrations"
                ? "border-amber-600 text-amber-700 bg-amber-50/70"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Registrations & Entries ({registrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sponsors")}
            className={`px-5 py-3 font-outfit font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === "sponsors"
                ? "border-amber-600 text-amber-700 bg-amber-50/70"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Sponsor Leads & Invoices ({sponsors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-3 font-outfit font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === "settings"
                ? "border-amber-600 text-amber-700 bg-amber-50/70"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Proving Ground Controls</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: REGISTRATIONS & RIGS */}
        {/* ======================================================== */}
        {activeTab === "registrations" && (
          <div className="space-y-6">
            {/* Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  CONFIRMED SLOTS
                </span>
                <div className="font-outfit text-3xl font-black text-neutral-950">
                  {confirmedCount} <span className="text-base text-neutral-400 font-normal">/ {settings.max_slots}</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-amber-600 h-full transition-all"
                    style={{ width: `${Math.min((confirmedCount / settings.max_slots) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">{slotsRemaining} slots remaining</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  PENDING INTAKE QUEUE
                </span>
                <div className="font-outfit text-3xl font-black text-amber-700">{pendingCallsCount}</div>
                <p className="text-[11px] text-neutral-500 mt-2 font-mono">Drivers awaiting follow-up call</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  SCRUTINEERING REVIEW
                </span>
                <div className="font-outfit text-3xl font-black text-purple-900">{reviewCount}</div>
                <p className="text-[11px] text-neutral-500 mt-2 font-mono">Mechanical inspection review</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  TOTAL APPLICATIONS
                </span>
                <div className="font-outfit text-3xl font-black text-neutral-950">{registrations.length}</div>
                <p className="text-[11px] text-neutral-500 mt-2 font-mono">Total recorded entries</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by code, driver, phone, vehicle..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-sm text-xs font-sans text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-mono text-neutral-800"
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="PENDING_CALL">CALL PENDING</option>
                  <option value="CALLED_FOLLOW_UP">FOLLOW-UP NEEDED</option>
                  <option value="SCRUTINEERING_REVIEW">SCRUTINEERING REVIEW</option>
                  <option value="SLOT_CONFIRMED">SLOT CONFIRMED</option>
                  <option value="WAITLISTED">WAITLISTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={exportRegistrationsCSV}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-sm text-xs font-mono font-bold text-neutral-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT CSV</span>
                </button>

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
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-sm font-outfit font-bold text-xs uppercase"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ ADD PHONE INTAKE</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-x-auto">
              {loadingRegistrations ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
                  <p className="font-mono text-xs text-neutral-500">LOADING REGISTRATIONS...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="py-16 text-center">
                  <Car className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="font-outfit font-bold text-neutral-700 uppercase">No registrations found</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-sand-100 text-[11px] font-mono text-neutral-700 uppercase font-bold">
                      <th className="py-3 px-4">CODE & SLOT</th>
                      <th className="py-3 px-4">DRIVER & CONTACT</th>
                      <th className="py-3 px-4">EXPERIENCE & TOTAL</th>
                      <th className="py-3 px-4">VEHICLE MACHINE</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {registrations.map((rec) => {
                      const statusStyle = STATUS_CONFIG[rec.status] || STATUS_CONFIG.PENDING_CALL;
                      const regCode = rec.registration_code || `MAT26-${String(rec.id).padStart(4, "0")}`;

                      return (
                        <tr key={rec.id} className="hover:bg-sand-50 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-amber-700 block">{regCode}</span>
                            <span className="text-[10px] font-mono text-neutral-500">
                              {rec.slot_number ? `SLOT #${String(rec.slot_number).padStart(2, "0")}` : "NO SLOT ASSIGNED"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="font-outfit font-bold text-sm text-neutral-900">{rec.driver_name}</div>
                            <div className="flex items-center space-x-2 mt-0.5 text-xs">
                              <a href={`tel:${rec.phone}`} className="text-amber-700 hover:underline font-mono">
                                {rec.phone}
                              </a>
                              {rec.whatsapp && (
                                <a
                                  href={`https://wa.me/${rec.whatsapp.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 hover:underline font-mono text-[10px]"
                                >
                                  [WhatsApp]
                                </a>
                              )}
                            </div>
                            {rec.email && <div className="text-[11px] text-neutral-500 truncate">{rec.email}</div>}
                          </td>

                          <td className="py-3.5 px-4 min-w-[160px]">
                            <div className="font-mono font-semibold text-neutral-900 text-xs">
                              {rec.experience_type || "OWN 4X4 EXPERIENCE"}
                            </div>
                            <div className="font-outfit font-black text-amber-700 text-sm">
                              ₹{rec.total_amount ? rec.total_amount.toLocaleString() : "6,999"}
                            </div>
                            <div className="text-[10px] font-mono text-neutral-500">
                              Crew: {(rec.passengers?.length || 0) + 1} Persons
                            </div>
                          </td>

                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="font-semibold text-neutral-900">{rec.vehicle_model}</div>
                            <div className="text-[10px] font-mono text-neutral-500">
                              {rec.vehicle_reg_number || "REG: NOT SPECIFIED"} • {rec.rig_class}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={rec.status}
                              onChange={(e) => handleStatusChange(rec.id, e.target.value as RegistrationRecord["status"])}
                              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                            >
                              <option value="PENDING_CALL">CALL PENDING</option>
                              <option value="CALLED_FOLLOW_UP">FOLLOW-UP NEEDED</option>
                              <option value="SCRUTINEERING_REVIEW">SCRUTINEERING REVIEW</option>
                              <option value="SLOT_CONFIRMED">SLOT CONFIRMED</option>
                              <option value="WAITLISTED">WAITLISTED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setDossierRecord(rec)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-mono rounded flex items-center space-x-1"
                                title="View Complete Scrutineering Dossier"
                              >
                                <Eye className="w-3 h-3" />
                                <span>DOSSIER</span>
                              </button>
                              <button
                                onClick={() => openEditModal(rec)}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-600 rounded"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(rec.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SPONSOR LEADS & INVOICES */}
        {/* ======================================================== */}
        {activeTab === "sponsors" && (
          <div className="space-y-6">
            {/* Sponsor Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  TOTAL SPONSOR LEADS
                </span>
                <div className="font-outfit text-3xl font-black text-neutral-950">{sponsors.length}</div>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">Corporate inquiries recorded</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-purple-700 uppercase font-bold block mb-1">
                  TAX INVOICES REQUESTED
                </span>
                <div className="font-outfit text-3xl font-black text-purple-900">{sponsorInvoicesCount}</div>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">Formal GST invoice inquiries</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block mb-1">
                  CONFIRMED PARTNERS
                </span>
                <div className="font-outfit text-3xl font-black text-emerald-800">{sponsorConfirmedCount}</div>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">Locked partnership deals</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  DECK DOWNLOADS / LEADS
                </span>
                <div className="font-outfit text-3xl font-black text-amber-700">
                  {sponsors.filter((s) => s.request_type === "DOWNLOAD_DECK").length}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">Direct pitch deck leads</p>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sponsorSearch}
                    onChange={(e) => setSponsorSearch(e.target.value)}
                    placeholder="Search company, contact person, email, GST..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-sm text-xs font-sans text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <select
                  value={sponsorTierFilter}
                  onChange={(e) => setSponsorTierFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-mono text-neutral-800"
                >
                  <option value="ALL">ALL TIERS</option>
                  <option value="Title">TITLE PARTNER (₹3.5L)</option>
                  <option value="Powered">POWERED BY (₹2L)</option>
                  <option value="Gold">GOLD PARTNER (₹1L)</option>
                  <option value="Silver">SILVER PARTNER (₹50K)</option>
                </select>

                <select
                  value={sponsorStatusFilter}
                  onChange={(e) => setSponsorStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-mono text-neutral-800"
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="INVOICE_SENT">INVOICE SENT</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="DECLINED">DECLINED</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={exportSponsorsCSV}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-sm text-xs font-mono font-bold text-neutral-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT SPONSORS CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-x-auto">
              {loadingSponsors ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
                  <p className="font-mono text-xs text-neutral-500">LOADING SPONSORS...</p>
                </div>
              ) : filteredSponsors.length === 0 ? (
                <div className="py-16 text-center">
                  <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="font-outfit font-bold text-neutral-700 uppercase">No sponsor inquiries found</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-sand-100 text-[11px] font-mono text-neutral-700 uppercase font-bold">
                      <th className="py-3 px-4">COMPANY & CONTACT</th>
                      <th className="py-3 px-4">TIER INTEREST</th>
                      <th className="py-3 px-4">REQUEST TYPE</th>
                      <th className="py-3 px-4">GST / TAX INFO</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {filteredSponsors.map((s) => {
                      const statusStyle = SPONSOR_STATUS_CONFIG[s.status] || SPONSOR_STATUS_CONFIG.NEW;

                      return (
                        <tr key={s.id} className="hover:bg-sand-50 transition-colors">
                          <td className="py-3.5 px-4 min-w-[200px]">
                            <div className="font-outfit font-bold text-sm text-neutral-900">{s.company_name}</div>
                            <div className="text-xs text-neutral-600">Attn: {s.contact_person}</div>
                            <div className="flex items-center space-x-2 mt-0.5 text-xs">
                              <a href={`tel:${s.phone}`} className="text-amber-700 hover:underline font-mono">
                                {s.phone}
                              </a>
                              <a href={`mailto:${s.email}`} className="text-neutral-500 hover:underline font-mono truncate max-w-[150px]">
                                {s.email}
                              </a>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 min-w-[180px]">
                            <span className="font-mono font-bold text-amber-800 block text-xs">{s.tier_interest}</span>
                            <span className="text-[10px] font-mono text-neutral-500">{s.brand_category || "Automotive / 4x4"}</span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                s.request_type === "REQUEST_INVOICE"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : s.request_type === "DOWNLOAD_DECK"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {s.request_type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 min-w-[150px]">
                            <div className="font-mono text-xs text-neutral-800">
                              {s.gst_number ? `GST: ${s.gst_number}` : "GST: Not Provided"}
                            </div>
                            {s.billing_address && (
                              <div className="text-[10px] text-neutral-500 truncate max-w-[180px]">
                                {s.billing_address}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={s.status}
                              onChange={(e) => handleSponsorStatusChange(s.id, e.target.value as SponsorInquiryRecord["status"])}
                              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                            >
                              <option value="NEW">NEW INQUIRY</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="INVOICE_SENT">INVOICE SENT</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="DECLINED">DECLINED</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setSponsorModalRecord(s)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-mono rounded flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>VIEW</span>
                              </button>
                              <button
                                onClick={() => handleDeleteSponsor(s.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROVING GROUND CONTROLS */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
            <div>
              <h2 className="font-outfit text-xl font-bold uppercase text-neutral-950">
                PROVING GROUND INFLOW SETTINGS
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Configure live registration switches, quota caps, and database parameters.
              </p>
            </div>

            <div className="p-4 bg-sand-100 border border-neutral-300 rounded flex items-center justify-between">
              <div>
                <span className="font-outfit font-bold text-sm block">PUBLIC REGISTRATION ACCESS</span>
                <span className="text-xs text-neutral-600">
                  {settings.online_registration_open
                    ? "Enabled: Web drivers can directly register and receive confirmation."
                    : "Disabled: Displays pre-intake phone dispatch hotline."}
                </span>
              </div>
              <button
                onClick={handleToggleOnlineRegistration}
                disabled={isTogglingSetting}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded ${
                  settings.online_registration_open
                    ? "bg-emerald-700 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {settings.online_registration_open ? "OPEN" : "CLOSED"}
              </button>
            </div>

            <div className="p-4 bg-sand-100 border border-neutral-300 rounded space-y-2">
              <span className="font-outfit font-bold text-sm block">MAXIMUM RIG CAPACITY</span>
              <span className="text-xs text-neutral-600 block">
                Total slot quota for technical scrutineering across 15+ obstacles proving ground.
              </span>
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="number"
                  value={settings.max_slots}
                  onChange={(e) => setSettings({ ...settings, max_slots: Number(e.target.value) })}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded text-sm w-28 font-mono font-bold"
                />
                <span className="text-xs font-mono text-neutral-500 uppercase">Registered Rigs Cap</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* DOSSIER MODAL: COMPLETE SCRUTINEERING FILE */}
      {/* ======================================================== */}
      {dossierRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-2xl w-full max-w-3xl my-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-sand-100">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">OFFICIAL SCRUTINEERING FILE</span>
                <h3 className="font-outfit font-bold text-lg text-neutral-950 uppercase">
                  {dossierRecord.registration_code || `MAT26-${String(dossierRecord.id).padStart(4, "0")}`} // {dossierRecord.driver_name}
                </h3>
              </div>
              <button onClick={() => setDossierRecord(null)} className="text-neutral-500 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs font-sans">
              {/* Experience & Payment */}
              <div className="p-4 bg-sand-50 rounded border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">EXPERIENCE</span>
                  <span className="font-bold text-neutral-900">{dossierRecord.experience_type || "OWN 4X4"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">DATE</span>
                  <span className="font-bold text-neutral-900">{dossierRecord.experience_date || "14 NOV 2026"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">TOTAL AMOUNT</span>
                  <span className="font-bold text-amber-700 font-outfit text-sm">
                    ₹{dossierRecord.total_amount ? dossierRecord.total_amount.toLocaleString() : "6,999"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">STATUS</span>
                  <span className="font-bold text-emerald-700">{dossierRecord.status}</span>
                </div>
              </div>

              {/* Driver & Contact */}
              <div>
                <h4 className="font-mono text-xs font-bold text-amber-800 uppercase mb-2">1. DRIVER PARTICULARS</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">NAME</span>
                    <span className="font-bold text-neutral-900">{dossierRecord.driver_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">PHONE</span>
                    <span className="font-mono text-neutral-900">{dossierRecord.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">EMAIL</span>
                    <span className="text-neutral-900">{dossierRecord.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">CITY / REGION</span>
                    <span className="text-neutral-900">{dossierRecord.driver_city || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Crew / Passengers */}
              {dossierRecord.passengers && dossierRecord.passengers.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs font-bold text-amber-800 uppercase mb-2">
                    2. CREW PASSENGERS ({dossierRecord.passengers.length})
                  </h4>
                  <div className="space-y-2">
                    {dossierRecord.passengers.map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-neutral-50 rounded border border-neutral-200 flex justify-between font-mono text-xs">
                        <span>Passenger {idx + 1}: <strong>{p.name}</strong> ({p.gender}, Age: {p.age})</span>
                        <span className="text-neutral-500">Rel: {p.relationship} | {p.mobile}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle & Modifications */}
              <div>
                <h4 className="font-mono text-xs font-bold text-amber-800 uppercase mb-2">3. MACHINE SPECIFICATIONS</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">MAKE / MODEL</span>
                    <span className="font-bold text-neutral-900">{dossierRecord.vehicle_model}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">REGISTRATION NO</span>
                    <span className="text-neutral-900">{dossierRecord.vehicle_reg_number || "TN XX XX XXXX"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">FUEL / TRANS</span>
                    <span className="text-neutral-900">{dossierRecord.fuel_type || "Diesel"} / {dossierRecord.transmission || "Manual"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">DRIVETRAIN</span>
                    <span className="text-neutral-900">{dossierRecord.drivetrain || "4x4 Low"}</span>
                  </div>
                </div>

                {dossierRecord.modifications && (
                  <div className="mt-2 p-3 bg-neutral-50 rounded text-xs font-mono">
                    <span className="text-[10px] text-neutral-500 uppercase block mb-1">ARMOR & MODS:</span>
                    <span>{dossierRecord.modifications}</span>
                  </div>
                )}
              </div>

              {/* Safety & Medical */}
              {dossierRecord.safety_experience && (
                <div>
                  <h4 className="font-mono text-xs font-bold text-amber-800 uppercase mb-2">4. SAFETY & MEDICAL</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded font-mono">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block">EXP LEVEL</span>
                      <span>{dossierRecord.safety_experience.experience_level || "Experienced"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block">BLOOD GROUP</span>
                      <span className="font-bold text-red-700">{(dossierRecord.safety_experience as any).bloodGroup || dossierRecord.safety_experience.blood_group || "O+"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block">ALLERGIES</span>
                      <span>{dossierRecord.safety_experience.allergies || "None"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block">MEDICAL NOTES</span>
                      <span>{(dossierRecord.safety_experience as any).medicalConditions || dossierRecord.safety_experience.medical_conditions || "None"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-neutral-200 bg-sand-50 flex justify-end">
              <button
                onClick={() => setDossierRecord(null)}
                className="px-5 py-2 bg-neutral-900 text-white rounded text-xs font-mono uppercase"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SPONSOR MODAL: DETAILS & INVOICE */}
      {/* ======================================================== */}
      {sponsorModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-sand-100">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">SPONSORSHIP INQUIRY FILE</span>
                <h3 className="font-outfit font-bold text-base text-neutral-950 uppercase">{sponsorModalRecord.company_name}</h3>
              </div>
              <button onClick={() => setSponsorModalRecord(null)} className="text-neutral-500 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded font-mono">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">CONTACT PERSON</span>
                  <span className="font-bold text-neutral-900">{sponsorModalRecord.contact_person}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">PHONE</span>
                  <a href={`tel:${sponsorModalRecord.phone}`} className="text-amber-700 hover:underline">
                    {sponsorModalRecord.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">EMAIL</span>
                  <a href={`mailto:${sponsorModalRecord.email}`} className="text-neutral-900 hover:underline">
                    {sponsorModalRecord.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">TIER INTEREST</span>
                  <span className="font-bold text-amber-800">{sponsorModalRecord.tier_interest}</span>
                </div>
              </div>

              {sponsorModalRecord.gst_number && (
                <div className="p-3 bg-neutral-50 rounded font-mono">
                  <span className="text-[10px] text-neutral-500 uppercase block">GST NUMBER:</span>
                  <span className="font-bold text-neutral-900">{sponsorModalRecord.gst_number}</span>
                </div>
              )}

              {sponsorModalRecord.billing_address && (
                <div className="p-3 bg-neutral-50 rounded font-mono">
                  <span className="text-[10px] text-neutral-500 uppercase block">BILLING ADDRESS:</span>
                  <span>{sponsorModalRecord.billing_address}</span>
                </div>
              )}

              {sponsorModalRecord.message && (
                <div className="p-3 bg-sand-50 rounded border border-neutral-200">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">INQUIRY MESSAGE / REMARKS:</span>
                  <p className="font-sans text-neutral-800 whitespace-pre-line">{sponsorModalRecord.message}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-neutral-200 bg-sand-50 flex justify-end">
              <button
                onClick={() => setSponsorModalRecord(null)}
                className="px-5 py-2 bg-neutral-900 text-white rounded text-xs font-mono uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Phone Registration / Edit Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-2xl w-full max-w-2xl my-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-sand-100">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-600" />
                <h3 className="font-outfit font-bold text-base uppercase text-neutral-950">
                  {editingRecord ? "EDIT REGISTRATION RECORD" : "LOG PHONE INTAKE"}
                </h3>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-neutral-500 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold uppercase mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.driver_name}
                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold uppercase mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold uppercase mb-1">Vehicle Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded font-mono font-bold"
                  >
                    <option value="PENDING_CALL">CALL PENDING</option>
                    <option value="CALLED_FOLLOW_UP">FOLLOW-UP NEEDED</option>
                    <option value="SCRUTINEERING_REVIEW">SCRUTINEERING REVIEW</option>
                    <option value="SLOT_CONFIRMED">SLOT CONFIRMED</option>
                    <option value="WAITLISTED">WAITLISTED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border rounded font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-outfit font-bold uppercase"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
