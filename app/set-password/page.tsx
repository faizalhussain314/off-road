"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [regCode, setRegCode] = useState("");

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [tokenParam, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to set password.");
      }

      if (data.session_token && typeof window !== "undefined") {
        sessionStorage.setItem("driver_session_token", data.session_token);
      }

      setSuccess(true);
      setRegCode(data.registration_code || "");
    } catch (err: any) {
      setError(err.message || "An error occurred while setting your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-neutral-900 border border-neutral-800 rounded-sm p-8 text-white shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-500 mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <div className="text-[10px] font-mono tracking-tactical text-amber-500 uppercase font-bold mb-1">
          OFFICIAL DRIVER PORTAL
        </div>
        <h1 className="font-outfit text-2xl font-black uppercase tracking-tight">
          SET YOUR ACCOUNT PASSWORD
        </h1>
        <p className="text-xs text-neutral-400 font-sans mt-2">
          Secure your registration profile to access and download your 4x4 event ticket upon admin verification.
        </p>
      </div>

      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-outfit text-xl font-bold uppercase text-white">
            PASSWORD CONFIGURED SUCCESSFULLY!
          </h2>
          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            Your login password has been saved. You can now access your ticket dashboard to track verification status and download your pass.
          </p>

          <div className="pt-4">
            <Link
              href={`/my-ticket?code=${encodeURIComponent(regCode)}`}
              className="inline-flex items-center justify-center space-x-2 w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-syne font-bold text-xs tracking-wider uppercase transition-colors"
            >
              <span>ACCESS MY TICKET DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-sm text-red-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {email && (
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                REGISTERED EMAIL
              </label>
              <input
                type="text"
                disabled
                value={email}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-sm text-xs font-mono text-neutral-400 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">
              CREATE NEW PASSWORD
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-sm text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-sm text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-syne font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>{loading ? "SAVING PASSWORD..." : "SAVE PASSWORD & PROCEED"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/my-ticket"
              className="text-xs text-neutral-400 hover:text-amber-400 font-mono transition-colors"
            >
              Already set your password? Log in to My Ticket →
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <main className="min-h-screen bg-sand-50 text-neutral-900 selection:bg-amber-600 selection:text-white flex flex-col justify-between">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 flex items-center justify-center">
        <Suspense fallback={<div className="text-center font-mono text-xs">Loading...</div>}>
          <SetPasswordForm />
        </Suspense>
      </div>
      <footer className="py-6 border-t border-neutral-200 text-center text-xs font-mono text-neutral-500">
        © 2026 MADPROTEK ADVENTURE TRAIL • OFFICIAL PARTICIPANT PORTAL
      </footer>
    </main>
  );
}
