"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { SponsorItem } from "@/lib/db";

export function SponsorShowcaseManager() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "TITLE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<number | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    tier: "Official Partner",
    is_title: false,
    is_active: true,
    website_url: "",
    display_order: 1,
  });

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sponsors-list?all=true", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.sponsors)) {
          setSponsors(json.sponsors);
        }
      }
    } catch (err) {
      console.error("Failed to fetch sponsors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (sponsor: SponsorItem) => {
    try {
      const res = await fetch("/api/sponsors-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sponsor.id,
          is_active: !sponsor.is_active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(
          "success",
          `"${sponsor.name}" is now ${!sponsor.is_active ? "ACTIVE (Visible)" : "INACTIVE (Hidden)"}.`
        );
        fetchSponsors();
      } else {
        showNotification("error", data.error || "Failed to update status");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Network error");
    }
  };

  // Set as Title Sponsor
  const handleSetTitle = async (id: number) => {
    try {
      const res = await fetch("/api/sponsors-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_TITLE_SPONSOR",
          id: id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Title sponsor updated successfully!");
        fetchSponsors();
      } else {
        showNotification("error", data.error || "Failed to set title sponsor");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Network error");
    }
  };

  // Remove Title Sponsor (leaves NO title sponsor)
  const handleRemoveTitle = async () => {
    try {
      const res = await fetch("/api/sponsors-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_TITLE_SPONSOR",
          id: null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Title sponsor removed. Public site will display only the partner grid.");
        fetchSponsors();
      } else {
        showNotification("error", data.error || "Failed to remove title sponsor");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Network error");
    }
  };

  // Delete Sponsor
  const handleDelete = async (sponsor: SponsorItem) => {
    if (!confirm(`Are you sure you want to delete "${sponsor.name}"?`)) return;
    try {
      const res = await fetch(`/api/sponsors-list?id=${sponsor.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", `"${sponsor.name}" deleted successfully.`);
        fetchSponsors();
      } else {
        showNotification("error", data.error || "Failed to delete sponsor");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Network error");
    }
  };

  // Logo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "sponsor_logo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, logo_url: data.url }));
        showNotification("success", "Logo uploaded successfully!");
      } else {
        showNotification("error", data.error || "Failed to upload logo");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Upload error");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingSponsorId(null);
    setForm({
      name: "",
      logo_url: "",
      tier: "Official Partner",
      is_title: false,
      is_active: true,
      website_url: "",
      display_order: sponsors.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (sponsor: SponsorItem) => {
    setEditingSponsorId(sponsor.id);
    setForm({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      tier: sponsor.tier || "Official Partner",
      is_title: Boolean(sponsor.is_title),
      is_active: sponsor.is_active,
      website_url: sponsor.website_url || "",
      display_order: sponsor.display_order || 1,
    });
    setIsModalOpen(true);
  };

  // Save Sponsor
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.logo_url.trim()) {
      showNotification("error", "Brand Name and Logo are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingSponsorId) {
        // Update
        const res = await fetch("/api/sponsors-list", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingSponsorId,
            ...form,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("success", "Sponsor updated successfully!");
          setIsModalOpen(false);
          fetchSponsors();
        } else {
          showNotification("error", data.error || "Failed to update sponsor");
        }
      } else {
        // Create
        const res = await fetch("/api/sponsors-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("success", "Sponsor added successfully!");
          setIsModalOpen(false);
          fetchSponsors();
        } else {
          showNotification("error", data.error || "Failed to add sponsor");
        }
      }
    } catch (err: any) {
      showNotification("error", err.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  const currentTitleSponsor = sponsors.find((s) => s.is_title);
  const activeCount = sponsors.filter((s) => s.is_active).length;
  const inactiveCount = sponsors.filter((s) => !s.is_active).length;

  const filteredSponsors = sponsors.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.tier && s.tier.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE") return s.is_active;
    if (statusFilter === "INACTIVE") return !s.is_active;
    if (statusFilter === "TITLE") return s.is_title;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm font-semibold transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : "bg-red-50 text-red-800 border border-red-300"
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-500 hover:text-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TELEMETRY & TITLE SPONSOR STATUS CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Title Sponsor Status Card */}
        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-700 uppercase font-bold tracking-wider flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>TITLE SPONSOR STATUS</span>
            </span>
            {currentTitleSponsor ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                ACTIVE TITLE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-600">
                NO TITLE SPONSOR
              </span>
            )}
          </div>

          {currentTitleSponsor ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 bg-neutral-50 p-2.5 rounded-md border border-neutral-200">
                <img
                  src={currentTitleSponsor.logo_url}
                  alt={currentTitleSponsor.name}
                  className="w-12 h-8 object-contain bg-white rounded border border-neutral-200 p-1"
                />
                <div className="overflow-hidden">
                  <div className="font-outfit font-black text-sm text-neutral-900 truncate">
                    {currentTitleSponsor.name}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500">
                    {currentTitleSponsor.tier || "Title Partner"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleRemoveTitle}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-300 hover:border-red-300 rounded text-xs font-mono font-bold uppercase transition-colors"
                >
                  Remove Title Sponsor (No Title)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-neutral-500">
                Currently no title sponsor is assigned. Public landing page will display only the partner logos grid.
              </p>
              {sponsors.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleSetTitle(Number(e.target.value));
                    }}
                    defaultValue=""
                    className="text-xs border border-neutral-300 rounded p-1.5 bg-white text-neutral-800"
                  >
                    <option value="" disabled>
                      Assign from existing sponsors...
                    </option>
                    {sponsors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.tier || "Partner"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Visibility Card */}
        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold tracking-wider flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>ACTIVE ON WEBSITE</span>
            </span>
            <div className="font-outfit text-3xl font-black text-neutral-950 mt-2">
              {activeCount}{" "}
              <span className="text-xs font-mono font-normal text-neutral-500">
                / {sponsors.length} total
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            These brands are currently visible on the public landing page sponsors section.
          </p>
        </div>

        {/* Inactive / Hidden Card */}
        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-neutral-600 uppercase font-bold tracking-wider flex items-center space-x-1.5">
              <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
              <span>DEACTIVATED / HIDDEN</span>
            </span>
            <div className="font-outfit text-3xl font-black text-neutral-950 mt-2">
              {inactiveCount}
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Hidden from the public site. Can be reactivated with 1 click anytime.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ACTION BAR: SEARCH, FILTERS, ADD BUTTON */}
      {/* ======================================================== */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sponsor brand name or tier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:border-amber-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="text-xs border border-neutral-300 rounded-md py-2 px-3 bg-white text-neutral-700"
          >
            <option value="ALL">All Sponsors</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
            <option value="TITLE">Title Sponsor</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSponsors}
            disabled={loading}
            className="p-2 border border-neutral-300 hover:bg-neutral-50 rounded-md text-neutral-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-syne font-bold text-xs uppercase tracking-wider rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ADD SPONSOR</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SPONSOR LIST TABLE */}
      {/* ======================================================== */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono uppercase tracking-wider text-neutral-600">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Brand Logo</th>
                <th className="py-3 px-4">Brand Name &amp; Tier</th>
                <th className="py-3 px-4">Title Sponsor Status</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4">Website</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs">
              {loading && sponsors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    Loading sponsors...
                  </td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500 font-mono">
                    No sponsors found matching filters.
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Order */}
                    <td className="py-3 px-4 font-mono font-bold text-neutral-500">
                      #{sponsor.display_order || sponsor.id}
                    </td>

                    {/* Logo Preview */}
                    <td className="py-3 px-4">
                      <div className="w-20 h-10 bg-neutral-100 rounded border border-neutral-200 p-1 flex items-center justify-center">
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="max-h-8 max-w-full object-contain"
                          onError={(e) => {
                            (e.target as any).src = "/M-word-logo.png";
                          }}
                        />
                      </div>
                    </td>

                    {/* Name & Tier */}
                    <td className="py-3 px-4">
                      <div className="font-outfit font-black text-sm text-neutral-900">
                        {sponsor.name}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500">
                        {sponsor.tier || "Official Partner"}
                      </div>
                    </td>

                    {/* Title Status */}
                    <td className="py-3 px-4">
                      {sponsor.is_title ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono text-[10px] font-bold uppercase">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>TITLE SPONSOR</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSetTitle(sponsor.id)}
                          className="text-[11px] font-mono text-neutral-500 hover:text-amber-700 hover:underline"
                        >
                          + Set as Title
                        </button>
                      )}
                    </td>

                    {/* Active/Inactive Status Switch */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(sponsor)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${
                          sponsor.is_active
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                            : "bg-neutral-200 text-neutral-700 border border-neutral-300 hover:bg-neutral-300"
                        }`}
                        title="Click to toggle status"
                      >
                        {sponsor.is_active ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>ACTIVE (SHOWING)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-neutral-500" />
                            <span>INACTIVE (HIDDEN)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Website */}
                    <td className="py-3 px-4">
                      {sponsor.website_url ? (
                        <a
                          href={sponsor.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 hover:text-amber-800 font-mono text-[11px] inline-flex items-center space-x-1 hover:underline truncate max-w-[150px]"
                        >
                          <span className="truncate">{sponsor.website_url.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-neutral-400 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(sponsor)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-amber-700"
                          title="Edit Sponsor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sponsor)}
                          className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-700"
                          title="Delete Sponsor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT SPONSOR MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-outfit font-black text-base uppercase text-neutral-900">
                  {editingSponsorId ? "Edit Sponsor Brand" : "Add New Sponsor Brand"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BFGoodrich Tires, Warn, ARB 4x4"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded p-2.5 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Logo Upload & URL */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  Brand Logo *
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <label className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-xs font-mono font-bold uppercase cursor-pointer flex items-center space-x-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? "Uploading..." : "Upload Logo File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-neutral-400 font-mono">or paste image URL below</span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="e.g. /sponsors/bfgoodrich.svg or https://..."
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded p-2.5 focus:outline-none focus:border-amber-600"
                />

                {/* Logo Preview */}
                {form.logo_url && (
                  <div className="mt-2 p-2 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center h-20">
                    <img
                      src={form.logo_url}
                      alt="Logo preview"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Tier / Category */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  Sponsorship Tier / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Official Title Partner, Winch Partner, Gear Partner"
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded p-2.5 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  Website / Social URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://brand.com"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded p-2.5 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  className="w-32 text-xs border border-neutral-300 rounded p-2 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Checkboxes: Title Sponsor & Active */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_title}
                    onChange={(e) => setForm({ ...form, is_title: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-neutral-900 flex items-center space-x-1">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>Set as Official Title Sponsor</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      Prominently showcases this brand in the headline title banner. Replaces any existing title sponsor.
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-neutral-900">
                      Active (Visible on public website)
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      If unchecked, the sponsor will be stored in database but hidden from the public website.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-mono font-bold uppercase rounded hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-syne font-bold uppercase tracking-wider rounded shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingSponsorId ? "Save Changes" : "Create Sponsor"}</span>
                    </>
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
