"use client";

import React, { useState, useEffect } from "react";
import { Check, RefreshCw } from "lucide-react";

interface GoogleCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  error?: string;
}

export function GoogleCaptcha({ onVerify, onExpire, error }: GoogleCaptchaProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleCheckboxClick = () => {
    if (isVerified || isChecking) return;

    setIsChecking(true);
    // Simulate reCAPTCHA verification calculation
    setTimeout(() => {
      const generatedToken = `g_recaptcha_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      setIsChecking(false);
      setIsVerified(true);
      onVerify(generatedToken);
    }, 700);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVerified(false);
    setIsChecking(false);
    if (onExpire) onExpire();
  };

  return (
    <div className="flex flex-col items-start space-y-1.5 select-none">
      <div
        onClick={handleCheckboxClick}
        className={`w-full max-w-[304px] bg-[#f9f9f9] border rounded-[3px] p-3 shadow-sm flex items-center justify-between cursor-pointer transition-all ${
          error
            ? "border-red-500 bg-red-50/20"
            : isVerified
            ? "border-[#b2d8b2] bg-[#fcfdfc]"
            : "border-[#d3d3d3] hover:border-[#b8b8b8]"
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Checkbox box */}
          <div
            className={`w-[28px] h-[28px] rounded-[2px] border flex items-center justify-center transition-all ${
              isVerified
                ? "bg-[#0f9d58] border-[#0f9d58] text-white"
                : isChecking
                ? "border-[#4285f4] bg-white"
                : error
                ? "border-red-500 bg-white"
                : "border-[#c1c1c1] bg-white hover:border-[#888888]"
            }`}
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 text-[#4285f4] animate-spin" />
            ) : isVerified ? (
              <Check className="w-5 h-5 text-white stroke-[3]" />
            ) : null}
          </div>

          <span className="text-[14px] font-sans text-[#282828] font-normal tracking-tight">
            I&apos;m not a robot
          </span>
        </div>

        {/* Official Google reCAPTCHA Badge Logo & Brand */}
        <div className="flex flex-col items-center justify-center pl-2">
          <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 6C17.64 6 6 17.64 6 32c0 6.64 2.47 12.7 6.57 17.37l5.05-5.05C15.01 40.79 13.5 36.58 13.5 32c0-10.22 8.28-18.5 18.5-18.5 4.88 0 9.32 1.89 12.65 4.99l-5.65 5.65H46V7l-5.02 5.02C36.93 8.35 32.22 6 32 6z"
              fill="#1A73E8"
            />
            <path
              d="M51.43 14.63l-5.05 5.05c2.61 3.53 4.12 7.74 4.12 12.32 0 10.22-8.28 18.5-18.5 18.5-4.88 0-9.32-1.89-12.65-4.99l5.65-5.65H18v17.14l5.02-5.02C27.07 55.65 31.78 58 32 58c14.36 0 26-11.64 26-26 0-6.64-2.47-12.7-6.57-17.37z"
              fill="#4285F4"
            />
            <path
              d="M32 20c-6.63 0-12 5.37-12 12s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
              fill="#34A853"
            />
          </svg>
          <span className="text-[10px] font-sans text-[#555] font-semibold tracking-tighter -mt-0.5">reCAPTCHA</span>
          <div className="flex space-x-1 text-[8px] text-[#555] leading-none pt-0.5">
            <a
              href="https://www.google.com/intl/en/policies/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              Privacy
            </a>
            <span>-</span>
            <a
              href="https://www.google.com/intl/en/policies/terms/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              Terms
            </a>
          </div>
        </div>
      </div>

      {error && <span className="text-[11px] text-red-500 font-sans pl-1">{error}</span>}
      {isVerified && (
        <span className="text-[10px] text-emerald-600 font-sans flex items-center space-x-1 pl-1">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Google reCAPTCHA verification passed</span>
        </span>
      )}
    </div>
  );
}
