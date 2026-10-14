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
  Tag,
  Percent,
  CreditCard,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { RegistrationRecord, SponsorInquiryRecord, PromoCodeRecord } from "@/lib/db";

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  PAID: {
    label: "CAPTURED (PAID)",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-400",
  },
  PENDING: {
    label: "PENDING",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  FAILED: {
    label: "FAILED",
    color: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-300",
  },
  USER_DROPPED: {
    label: "DROPPED",
    color: "text-neutral-700",
    bg: "bg-neutral-100",
    border: "border-neutral-300",
  },
};

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
  const [activeTab, setActiveTab] = useState<"registrations" | "sponsors" | "promocodes" | "settings">("registrations");

  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [syncingPaymentId, setSyncingPaymentId] = useState<number | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Sponsor Inquiries state
  const [sponsors, setSponsors] = useState<SponsorInquiryRecord[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [sponsorTierFilter, setSponsorTierFilter] = useState("ALL");
  const [sponsorStatusFilter, setSponsorStatusFilter] = useState("ALL");

  // Promo Codes state
  const [promos, setPromos] = useState<PromoCodeRecord[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoSearch, setPromoSearch] = useState("");
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: "",
    description: "",
    discount_type: "FLAT" as "FLAT" | "PERCENTAGE",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    max_uses: "",
    is_active: true,
  });
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoFormError, setPromoFormError] = useState("");
  const [promoNotice, setPromoNotice] = useState("");

  // Settings & DB State
  const [settings, setSettings] = useState<{
    online_registration_open: boolean;
    max_slots: number;
    price_early_bird: number;
    price_regular: number;
    price_organiser: number;
    price_extreme: number;
    price_additional_participant: number;
    registration_closed_message: string;
    mysql_connected: boolean;
    database_host: string;
    database_name: string;
  }>({
    online_registration_open: true,
    max_slots: 50,
    price_early_bird: 5999,
    price_regular: 6999,
    price_organiser: 1999,
    price_extreme: 999,
    price_additional_participant: 699,
    registration_closed_message:
      "Online registrations for 4X4 Adventure Trail 2026 are currently closed. Please contact event marshals for on-spot inquiry or waitlist.",
    mysql_connected: false,
    database_host: "localhost",
    database_name: "madprotek_offroad",
  });
  const [isTogglingSetting, setIsTogglingSetting] = useState(false);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState("");

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
      if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter);

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
  }, [searchTerm, statusFilter, classFilter, paymentFilter]);

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

  // Fetch Promo Codes
  const fetchPromoCodes = useCallback(async () => {
    try {
      setLoadingPromos(true);
      const res = await fetch("/api/promocodes");
      const json = await res.json();
      if (json.success) {
        setPromos(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch promo codes:", err);
    } finally {
      setLoadingPromos(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      fetchRegistrations();
      fetchSponsors();
      fetchPromoCodes();
    }
  }, [isAuthenticated, fetchSettings, fetchRegistrations, fetchSponsors, fetchPromoCodes]);

  // Promo Code Handlers
  const handleOpenCreatePromo = () => {
    setEditingPromoId(null);
    setPromoForm({
      code: "",
      description: "",
      discount_type: "FLAT",
      discount_value: "",
      min_order_amount: "",
      max_discount_amount: "",
      max_uses: "",
      is_active: true,
    });
    setPromoFormError("");
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (promo: PromoCodeRecord) => {
    setEditingPromoId(promo.id);
    setPromoForm({
      code: promo.code,
      description: promo.description || "",
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      min_order_amount: promo.min_order_amount ? String(promo.min_order_amount) : "",
      max_discount_amount: promo.max_discount_amount ? String(promo.max_discount_amount) : "",
      max_uses: promo.max_uses ? String(promo.max_uses) : "",
      is_active: promo.is_active,
    });
    setPromoFormError("");
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoFormError("");

    if (!promoForm.code.trim()) {
      setPromoFormError("Promo code is required.");
      return;
    }
    const val = Number(promoForm.discount_value);
    if (isNaN(val) || val <= 0) {
      setPromoFormError("Discount value must be greater than 0.");
      return;
    }

    try {
      setSavingPromo(true);
      const payload: any = {
        code: promoForm.code.trim().toUpperCase(),
        description: promoForm.description.trim(),
        discount_type: promoForm.discount_type,
        discount_value: val,
        min_order_amount: promoForm.min_order_amount ? Number(promoForm.min_order_amount) : 0,
        max_discount_amount: promoForm.max_discount_amount ? Number(promoForm.max_discount_amount) : undefined,
        max_uses: promoForm.max_uses ? Number(promoForm.max_uses) : undefined,
        is_active: promoForm.is_active,
      };

      if (editingPromoId) {
        payload.id = editingPromoId;
        const res = await fetch("/api/promocodes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setPromoNotice(`Promo code "${payload.code}" updated successfully.`);
          setIsPromoModalOpen(false);
          fetchPromoCodes();
          setTimeout(() => setPromoNotice(""), 4000);
        } else {
          setPromoFormError(json.error || "Failed to update promo code.");
        }
      } else {
        const res = await fetch("/api/promocodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setPromoNotice(`Promo code "${payload.code}" created successfully.`);
          setIsPromoModalOpen(false);
          fetchPromoCodes();
          setTimeout(() => setPromoNotice(""), 4000);
        } else {
          setPromoFormError(json.error || "Failed to create promo code.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setPromoFormError("Network error while saving promo code.");
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (id: number, currentActive: boolean) => {
    try {
      const res = await fetch("/api/promocodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      const json = await res.json();
      if (json.success) {
        setPromos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
        );
      }
    } catch (err) {
      console.error("Toggle promo status error:", err);
    }
  };

  const handleDeletePromo = async (id: number, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) return;
    try {
      const res = await fetch(`/api/promocodes?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
        setPromoNotice(`Promo code "${code}" deleted.`);
        setTimeout(() => setPromoNotice(""), 4000);
      }
    } catch (err) {
      console.error("Delete promo error:", err);
    }
  };

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

  // Save All Settings & Prices
  const handleSaveAllSettings = async () => {
    try {
      setIsTogglingSetting(true);
      setSettingsSavedNotice("");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          online_registration_open: settings.online_registration_open,
          max_slots: settings.max_slots,
          price_early_bird: settings.price_early_bird,
          price_regular: settings.price_regular,
          price_organiser: settings.price_organiser,
          price_extreme: settings.price_extreme,
          price_additional_participant: settings.price_additional_participant,
          registration_closed_message: settings.registration_closed_message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSettingsSavedNotice("Settings & Pricing successfully saved and applied to live site!");
        setTimeout(() => setSettingsSavedNotice(""), 4000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
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

  // Quick Payment Status Update for Registrations
  const handlePaymentStatusChange = async (id: number, newPaymentStatus: string) => {
    try {
      const updates: any = { payment_status: newPaymentStatus };
      if (newPaymentStatus === "PAID") {
        updates.status = "SLOT_CONFIRMED";
        updates.payment_time = new Date().toISOString();
      }
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...json.data } : r))
        );
        if (dossierRecord && dossierRecord.id === id) {
          setDossierRecord((prev) => prev ? { ...prev, ...json.data } : null);
        }
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  // Live Sync with Cashfree Payment Gateway
  const handleVerifyPayment = async (orderId?: string, regId?: number) => {
    if (!orderId && !regId) return;
    try {
      if (regId) setSyncingPaymentId(regId);
      setSyncMessage(null);

      const res = await fetch("/api/cashfree/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, registration_id: regId }),
      });
      const data = await res.json();

      if (data.success && data.registration) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === data.registration.id ? data.registration : r))
        );
        if (dossierRecord && dossierRecord.id === data.registration.id) {
          setDossierRecord(data.registration);
        }
        setSyncMessage(`Cashfree Status: ${data.payment_status} (${data.payment_method || "Captured"})`);
        setTimeout(() => setSyncMessage(null), 4000);
      } else {
        setSyncMessage(data.error || "Payment verification incomplete or not captured yet.");
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error verifying with Cashfree:", err);
      setSyncMessage(err.message || "Failed to contact Cashfree verification API");
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setSyncingPaymentId(null);
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
      "PAYMENT_STATUS",
      "PAYMENT_AMOUNT",
      "PAYMENT_ID",
      "PAYMENT_ORDER_ID",
      "PAYMENT_METHOD",
      "PAYMENT_TIME",
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
      r.payment_status || "PENDING",
      r.payment_amount || r.total_amount || 0,
      `"${r.payment_id || ""}"`,
      `"${r.payment_order_id || ""}"`,
      `"${r.payment_method || ""}"`,
      `"${r.payment_time || ""}"`,
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

  // Cashfree PG Metrics
  const paidRegistrations = registrations.filter((r) => r.payment_status === "PAID");
  const paidCount = paidRegistrations.length;
  const totalCapturedRevenue = paidRegistrations.reduce(
    (acc, r) => acc + (Number(r.payment_amount) || Number(r.total_amount) || 0),
    0
  );
  const pendingPaymentCount = registrations.filter(
    (r) => !r.payment_status || r.payment_status === "PENDING"
  ).length;

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
            onClick={() => setActiveTab("promocodes")}
            className={`px-5 py-3 font-outfit font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === "promocodes"
                ? "border-amber-600 text-amber-700 bg-amber-50/70"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promo Codes & Coupons ({promos.length})</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

              {/* Cashfree PG Revenue Card */}
              <div className="p-5 bg-white border border-emerald-300 rounded-sm shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block mb-1 flex items-center justify-between">
                  <span>CASHFREE REVENUE</span>
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>CAPTURED</span>
                  </span>
                </span>
                <div className="font-outfit text-3xl font-black text-emerald-700">
                  ₹{totalCapturedRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-neutral-600 mt-2 font-mono">
                  <strong className="text-emerald-800">{paidCount} Paid</strong> • {pendingPaymentCount} Pending
                </p>
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

            {/* Sync Feedback Alert */}
            {syncMessage && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs font-mono flex items-center justify-between animate-fadeIn shadow-sm">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>{syncMessage}</span>
                </div>
                <button
                  onClick={() => setSyncMessage(null)}
                  className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by code, driver, phone, Cashfree Order ID..."
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

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-mono text-neutral-800 font-bold"
                >
                  <option value="ALL">ALL PAYMENTS</option>
                  <option value="PAID">✓ CAPTURED (PAID)</option>
                  <option value="PENDING">⏳ PAYMENT PENDING</option>
                  <option value="FAILED">✕ FAILED</option>
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
                      <th className="py-3 px-4">PAYMENT (CASHFREE)</th>
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
                            {rec.promo_code && (
                              <div className="inline-flex items-center space-x-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                <span>PROMO: {rec.promo_code}</span>
                                {rec.discount_amount ? <span>(-₹{rec.discount_amount.toLocaleString()})</span> : null}
                              </div>
                            )}
                            <div className="text-[10px] font-mono text-neutral-500">
                              Crew: {(rec.passengers?.length || 0) + 1} Persons
                            </div>
                          </td>

                          {/* Cashfree Payment Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap min-w-[170px]">
                            {rec.payment_status === "PAID" ? (
                              <div>
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>CAPTURED</span>
                                  <span>(₹{(rec.payment_amount || rec.total_amount || 0).toLocaleString()})</span>
                                </span>
                                <div className="text-[10px] font-mono text-neutral-600 mt-1 flex items-center space-x-1">
                                  <CreditCard className="w-3 h-3 text-neutral-400" />
                                  <span>{rec.payment_method || "Cashfree PG"}</span>
                                </div>
                                {rec.payment_id && (
                                  <div className="text-[9px] font-mono text-neutral-400 truncate max-w-[160px]" title={`Payment ID: ${rec.payment_id}`}>
                                    Ref: {rec.payment_id}
                                  </div>
                                )}
                              </div>
                            ) : rec.payment_status === "FAILED" ? (
                              <div>
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-50 text-red-700 border border-red-300">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span>FAILED</span>
                                </span>
                                <button
                                  onClick={() => handleVerifyPayment(rec.payment_order_id, rec.id)}
                                  disabled={syncingPaymentId === rec.id}
                                  className="text-[10px] font-mono text-amber-700 hover:text-amber-900 block mt-1 hover:underline"
                                >
                                  {syncingPaymentId === rec.id ? "Checking..." : "↻ Re-check PG"}
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center space-x-1">
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>PENDING</span>
                                  </span>
                                  <button
                                    onClick={() => handlePaymentStatusChange(rec.id, "PAID")}
                                    className="text-[9px] font-mono px-1.5 py-0.5 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-neutral-600 rounded border border-neutral-300"
                                    title="Mark Captured Manually"
                                  >
                                    Mark Paid
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleVerifyPayment(rec.payment_order_id, rec.id)}
                                  disabled={syncingPaymentId === rec.id}
                                  className="text-[10px] font-mono text-amber-700 hover:text-amber-900 block mt-1 hover:underline flex items-center space-x-1"
                                  title="Check live status from Cashfree"
                                >
                                  <RefreshCw className={`w-2.5 h-2.5 ${syncingPaymentId === rec.id ? "animate-spin" : ""}`} />
                                  <span>Verify Cashfree</span>
                                </button>
                              </div>
                            )}
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
                              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} block`}
                            >
                              <option value="PENDING_CALL">CALL PENDING</option>
                              <option value="CALLED_FOLLOW_UP">FOLLOW-UP NEEDED</option>
                              <option value="SCRUTINEERING_REVIEW">SCRUTINEERING REVIEW</option>
                              <option value="SLOT_CONFIRMED">SLOT CONFIRMED</option>
                              <option value="WAITLISTED">WAITLISTED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                            {rec.captcha_verified && (
                              <span className="inline-flex items-center space-x-1 text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                <span>reCAPTCHA OK</span>
                              </span>
                            )}
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
        {/* TAB: PROMO CODES & CAMPAIGNS */}
        {/* ======================================================== */}
        {activeTab === "promocodes" && (
          <div className="space-y-6">
            {/* Promo Top Banner & Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  TOTAL PROMO CODES
                </span>
                <div className="font-outfit text-3xl font-black text-neutral-950">{promos.length}</div>
                <p className="text-[11px] text-neutral-500 mt-2 font-mono">Configured coupon codes</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block mb-1">
                  ACTIVE CAMPAIGNS
                </span>
                <div className="font-outfit text-3xl font-black text-emerald-800">
                  {promos.filter((p) => p.is_active).length}
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 font-mono">Live codes valid for checkout</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-1">
                  TOTAL REDEMPTIONS
                </span>
                <div className="font-outfit text-3xl font-black text-amber-700">
                  {promos.reduce((acc, p) => acc + (p.usage_count || 0), 0)}
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 font-mono">Rigs registered using promo</p>
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-sm shadow-sm">
                <span className="text-[10px] font-mono text-purple-700 uppercase font-bold block mb-1">
                  DISCOUNT TYPES
                </span>
                <div className="font-outfit text-xl font-bold text-neutral-900 mt-1">
                  {promos.filter((p) => p.discount_type === "FLAT").length} Flat / {promos.filter((p) => p.discount_type === "PERCENTAGE").length} %
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 font-mono">Configured discount rules</p>
              </div>
            </div>

            {/* Notice Bar */}
            {promoNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-mono flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{promoNotice}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoSearch}
                  onChange={(e) => setPromoSearch(e.target.value)}
                  placeholder="SEARCH BY CODE OR DESCRIPTION..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-sm text-xs font-mono placeholder:text-neutral-400 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchPromoCodes}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-sm text-xs font-mono font-bold text-neutral-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPromos ? "animate-spin" : ""}`} />
                  <span>REFRESH</span>
                </button>

                <button
                  onClick={handleOpenCreatePromo}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-sm font-outfit font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ CREATE PROMO CODE</span>
                </button>
              </div>
            </div>

            {/* Promo Codes Table */}
            <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-x-auto">
              {loadingPromos ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
                  <p className="font-mono text-xs text-neutral-500">LOADING PROMO CODES...</p>
                </div>
              ) : promos.length === 0 ? (
                <div className="py-16 text-center">
                  <Tag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="font-outfit font-bold text-neutral-700 uppercase">No promo codes created yet</p>
                  <p className="text-xs text-neutral-500 font-mono mt-1">
                    Click &quot;+ CREATE PROMO CODE&quot; to add your first discount campaign.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-sand-100 text-[11px] font-mono text-neutral-700 uppercase font-bold">
                      <th className="py-3 px-4">PROMO CODE</th>
                      <th className="py-3 px-4">DISCOUNT VALUE</th>
                      <th className="py-3 px-4">CONDITIONS</th>
                      <th className="py-3 px-4">REDEMPTIONS</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {promos
                      .filter((p) => {
                        if (!promoSearch) return true;
                        const q = promoSearch.toLowerCase();
                        return (
                          p.code.toLowerCase().includes(q) ||
                          (p.description && p.description.toLowerCase().includes(q))
                        );
                      })
                      .map((promo) => (
                        <tr key={promo.id} className="hover:bg-sand-50 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-xs bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded">
                                {promo.code}
                              </span>
                            </div>
                            {promo.description && (
                              <span className="text-[11px] text-neutral-500 block mt-1 max-w-xs">
                                {promo.description}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-outfit font-black text-sm text-neutral-900">
                              {promo.discount_type === "FLAT"
                                ? `₹${promo.discount_value.toLocaleString()} FLAT`
                                : `${promo.discount_value}% OFF`}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-500 block">
                              {promo.discount_type === "FLAT" ? "Direct Subtotal Deduction" : "Percentage Off Subtotal"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-neutral-700 font-mono text-xs">
                              Min Order: {promo.min_order_amount ? `₹${promo.min_order_amount.toLocaleString()}` : "None"}
                            </div>
                            {promo.discount_type === "PERCENTAGE" && promo.max_discount_amount && (
                              <div className="text-neutral-500 text-[10px] font-mono">
                                Max Cap: ₹{promo.max_discount_amount.toLocaleString()}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-neutral-900">
                              {promo.usage_count || 0}
                            </span>
                            <span className="text-neutral-500 font-mono text-[10px]">
                              {promo.max_uses ? ` / ${promo.max_uses} limit` : " uses (unlimited)"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePromoActive(promo.id, promo.is_active)}
                              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                                promo.is_active
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200"
                              }`}
                            >
                              {promo.is_active ? "ACTIVE" : "PAUSED"}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleOpenEditPromo(promo)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-700 font-mono text-xs font-semibold"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>EDIT</span>
                            </button>
                            <button
                              onClick={() => handleDeletePromo(promo.id, promo.code)}
                              className="inline-flex items-center space-x-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700 font-mono text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
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
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 max-w-3xl shadow-sm space-y-6">
            <div>
              <h2 className="font-outfit text-xl font-bold uppercase text-neutral-950">
                PROVING GROUND &amp; PRICING CONTROLS
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Configure live registration open/close switch, dynamic ticket pricing tiers, and maximum slot quotas.
              </p>
            </div>

            {settingsSavedNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-mono flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{settingsSavedNotice}</span>
              </div>
            )}

            {/* Registration Access Toggle */}
            <div className="p-5 bg-sand-100 border border-neutral-300 rounded space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-outfit font-bold text-sm block">PUBLIC REGISTRATION ACCESS</span>
                  <span className="text-xs text-neutral-600">
                    {settings.online_registration_open
                      ? "ONLINE: Web users can submit registrations and receive immediate confirmation."
                      : "CLOSED: Online registration is currently shut down. Closed notice is shown to visitors."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleOnlineRegistration}
                  disabled={isTogglingSetting}
                  className={`px-5 py-2.5 text-xs font-mono font-bold uppercase rounded transition-all shadow-sm ${
                    settings.online_registration_open
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                      : "bg-red-700 hover:bg-red-800 text-white"
                  }`}
                >
                  {settings.online_registration_open ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}
                </button>
              </div>

              {/* Closed Notice Message */}
              <div className="pt-2 border-t border-neutral-200">
                <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                  Closed Announcement Message (Displayed when registration is closed)
                </label>
                <textarea
                  rows={2}
                  value={settings.registration_closed_message}
                  onChange={(e) => setSettings({ ...settings, registration_closed_message: e.target.value })}
                  placeholder="Enter notice shown to users when registrations are closed"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Dynamic Pricing Configuration */}
            <div className="p-5 bg-sand-50 border border-neutral-300 rounded space-y-4">
              <div>
                <span className="font-outfit font-bold text-sm block">DYNAMIC PRICING CONFIGURATION (₹ INR)</span>
                <span className="text-xs text-neutral-600">
                  Update experience and crew fees. Prices immediately reflect across the public registration website.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                  <label className="block font-bold text-neutral-800 uppercase text-[11px]">
                    Day 1: Own 4x4 Early Bird (₹)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-neutral-500">₹</span>
                    <input
                      type="number"
                      value={settings.price_early_bird}
                      onChange={(e) => setSettings({ ...settings, price_early_bird: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-bold text-neutral-900 text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block">Default: ₹5,999 (First 10 Vehicles)</span>
                </div>

                <div className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                  <label className="block font-bold text-neutral-800 uppercase text-[11px]">
                    Day 1: Own 4x4 Regular (₹)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-neutral-500">₹</span>
                    <input
                      type="number"
                      value={settings.price_regular}
                      onChange={(e) => setSettings({ ...settings, price_regular: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-bold text-neutral-900 text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block">Default: ₹6,999 (Next 10 Vehicles)</span>
                </div>

                <div className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                  <label className="block font-bold text-neutral-800 uppercase text-[11px]">
                    Day 2: Organiser 4x4 Experience (₹)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-neutral-500">₹</span>
                    <input
                      type="number"
                      value={settings.price_organiser}
                      onChange={(e) => setSettings({ ...settings, price_organiser: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-bold text-neutral-900 text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block">Default: ₹1,999 / Person</span>
                </div>

                <div className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                  <label className="block font-bold text-neutral-800 uppercase text-[11px]">
                    Day 2: Extreme 4x4 Thrill (₹)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-neutral-500">₹</span>
                    <input
                      type="number"
                      value={settings.price_extreme}
                      onChange={(e) => setSettings({ ...settings, price_extreme: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-bold text-neutral-900 text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block">Default: ₹999 / Person</span>
                </div>

                <div className="p-3 bg-white border border-neutral-200 rounded space-y-1 sm:col-span-2">
                  <label className="block font-bold text-neutral-800 uppercase text-[11px]">
                    Additional Crew Participant Fee (₹ / Person)
                  </label>
                  <div className="flex items-center space-x-2 max-w-xs">
                    <span className="text-sm font-bold text-neutral-500">₹</span>
                    <input
                      type="number"
                      value={settings.price_additional_participant}
                      onChange={(e) => setSettings({ ...settings, price_additional_participant: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-bold text-neutral-900 text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block">Default: ₹699 per extra passenger beyond standard crew</span>
                </div>
              </div>
            </div>

            {/* Maximum Rig Capacity */}
            <div className="p-5 bg-sand-100 border border-neutral-300 rounded space-y-2">
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

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAllSettings}
                disabled={isTogglingSetting}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-outfit font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isTogglingSetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>SAVING CONFIGURATION...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>SAVE CONFIGURATION &amp; PRICING</span>
                  </>
                )}
              </button>
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
                  {dossierRecord.promo_code && (
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      Code: {dossierRecord.promo_code} (-₹{dossierRecord.discount_amount?.toLocaleString()})
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">STATUS</span>
                  <span className="font-bold text-emerald-700">{dossierRecord.status}</span>
                </div>
              </div>

              {/* Cashfree Payment & Settlement Dossier */}
              <div className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-mono text-xs font-bold text-neutral-900 uppercase">
                      CASHFREE PAYMENT CAPTURE &amp; AUDIT
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVerifyPayment(dossierRecord.payment_order_id, dossierRecord.id)}
                      disabled={syncingPaymentId === dossierRecord.id}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-mono font-bold rounded flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingPaymentId === dossierRecord.id ? "animate-spin" : ""}`} />
                      <span>{syncingPaymentId === dossierRecord.id ? "Syncing..." : "Re-sync Cashfree"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Capture Status</span>
                    {dossierRecord.payment_status === "PAID" ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>CAPTURED (PAID)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{dossierRecord.payment_status || "PENDING"}</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Captured Amount</span>
                    <span className="font-bold text-neutral-900 font-outfit text-sm">
                      ₹{(dossierRecord.payment_amount || dossierRecord.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Payment Method</span>
                    <span className="text-neutral-900 font-semibold">{dossierRecord.payment_method || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Payment Timestamp</span>
                    <span className="text-neutral-900 text-[11px]">
                      {dossierRecord.payment_time ? new Date(dossierRecord.payment_time).toLocaleString("en-IN") : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 uppercase block">Cashfree Payment ID / Ref</span>
                    <span className="text-neutral-900 select-all font-bold">
                      {dossierRecord.payment_id || "No transaction reference yet"}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 uppercase block">Cashfree Order ID</span>
                    <span className="text-neutral-900 select-all font-bold">
                      {dossierRecord.payment_order_id || "Not assigned"}
                    </span>
                  </div>
                </div>

                {/* Quick Payment Status Toggle for Admin */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] font-mono">
                  <span className="text-neutral-500">Manual Payment Status Override:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePaymentStatusChange(dossierRecord.id, "PAID")}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                    >
                      Mark Captured (Paid)
                    </button>
                    <button
                      onClick={() => handlePaymentStatusChange(dossierRecord.id, "PENDING")}
                      className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded text-[10px] font-bold"
                    >
                      Reset to Pending
                    </button>
                  </div>
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

              {/* Documents & Scrutineering Files */}
              {dossierRecord.documents && (
                <div>
                  <h4 className="font-mono text-xs font-bold text-amber-800 uppercase mb-2">5. UPLOADED VEHICLE DOCUMENTS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-50 p-3 rounded font-mono text-xs">
                    <div className="p-2 bg-white rounded border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 uppercase block">RC CERTIFICATE</span>
                      <span className="font-bold text-neutral-900 block truncate">
                        {dossierRecord.documents.rc_file || (dossierRecord.documents.rc_uploaded ? "RC Verified" : "Not Provided")}
                      </span>
                      {dossierRecord.documents.rc_url && (
                        <a href={dossierRecord.documents.rc_url} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline text-[10px] flex items-center space-x-1 mt-1">
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>View Document</span>
                        </a>
                      )}
                    </div>
                    <div className="p-2 bg-white rounded border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 uppercase block">INSURANCE CERTIFICATE</span>
                      <span className="font-bold text-neutral-900 block truncate">
                        {dossierRecord.documents.insurance_company || "Policy on Record"}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">Exp: {dossierRecord.documents.insurance_expiry || "Valid"}</span>
                      {dossierRecord.documents.insurance_url && (
                        <a href={dossierRecord.documents.insurance_url} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline text-[10px] flex items-center space-x-1 mt-1">
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>View Policy</span>
                        </a>
                      )}
                    </div>
                    <div className="p-2 bg-white rounded border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 uppercase block">PUC CERTIFICATE</span>
                      <span className="font-bold text-neutral-900 block truncate">
                        {dossierRecord.documents.puc_number || "PUC on Record"}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">Exp: {dossierRecord.documents.puc_expiry || "Valid"}</span>
                      {dossierRecord.documents.puc_url && (
                        <a href={dossierRecord.documents.puc_url} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline text-[10px] flex items-center space-x-1 mt-1">
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>View PUC</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Captcha Status */}
              <div className="p-3 bg-neutral-100 rounded flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-neutral-800">GOOGLE RECAPTCHA VALIDATION</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  {dossierRecord.captcha_verified ? "PASSED & VERIFIED" : "MANUAL / STANDARD"}
                </span>
              </div>
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

      {/* ======================================================== */}
      {/* PROMO CODE CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-2xl w-full max-w-lg my-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-sand-100">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">
                  PROMO CAMPAIGN CONFIGURATION
                </span>
                <h3 className="font-outfit font-bold text-lg text-neutral-950 uppercase">
                  {editingPromoId ? `EDIT PROMO CODE: ${promoForm.code}` : "CREATE NEW PROMO CODE"}
                </h3>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="p-6 space-y-4 text-xs font-sans">
              {promoFormError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 font-mono">
                  {promoFormError}
                </div>
              )}

              <div>
                <label className="block font-mono font-bold text-neutral-800 uppercase mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="E.G. TRAIL10, MAD500"
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded font-mono font-bold text-sm uppercase text-neutral-900 focus:outline-none focus:border-amber-600"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Code entered by participants during checkout (auto-uppercase)
                </span>
              </div>

              <div>
                <label className="block font-mono font-bold text-neutral-800 uppercase mb-1">
                  Description / Campaign Name
                </label>
                <input
                  type="text"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="e.g. Special Flat Discount for Trail Enthusiasts"
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-neutral-800 uppercase mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={promoForm.discount_type}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discount_type: e.target.value as "FLAT" | "PERCENTAGE" })
                    }
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded font-mono font-bold text-neutral-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="FLAT">FLAT AMOUNT (₹)</option>
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono font-bold text-neutral-800 uppercase mb-1">
                    Discount Value * {promoForm.discount_type === "FLAT" ? "(₹)" : "(%)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={promoForm.discount_value}
                    onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                    placeholder={promoForm.discount_type === "FLAT" ? "500" : "10"}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded font-bold text-neutral-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-neutral-800 uppercase mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={promoForm.min_order_amount}
                    onChange={(e) => setPromoForm({ ...promoForm, min_order_amount: e.target.value })}
                    placeholder="0 (No minimum)"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:border-amber-600"
                  />
                  <span className="text-[10px] text-neutral-500 block mt-0.5">Leave blank or 0 for any amount</span>
                </div>

                <div>
                  <label className="block font-mono font-bold text-neutral-800 uppercase mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={promoForm.discount_type === "FLAT"}
                    value={promoForm.max_discount_amount}
                    onChange={(e) => setPromoForm({ ...promoForm, max_discount_amount: e.target.value })}
                    placeholder="Optional max cap"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-400 focus:outline-none focus:border-amber-600"
                  />
                  <span className="text-[10px] text-neutral-500 block mt-0.5">Applicable for percentage discounts</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-neutral-800 uppercase mb-1">
                    Maximum Uses Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={promoForm.max_uses}
                    onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_active_toggle"
                    checked={promoForm.is_active}
                    onChange={(e) => setPromoForm({ ...promoForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                  />
                  <label htmlFor="is_active_toggle" className="font-mono font-bold text-neutral-800 text-xs cursor-pointer">
                    Active &amp; Available for Checkout
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded font-mono uppercase text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPromo}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-outfit font-bold uppercase tracking-wider flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {savingPromo ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPromoId ? "Update Promo Code" : "Create Promo Code"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
