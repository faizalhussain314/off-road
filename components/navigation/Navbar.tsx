"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "THE TRAIL", href: "#trail" },
    { label: "SPONSORS", href: "#sponsors" },
    { label: "GALLERY", href: "#gallery" },
    { label: "EXPERIENCE", href: "#experience" },
    { label: "CONTACT", href: "#contact" },
  ];

  const handleRegisterNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (typeof window !== "undefined") {
      if (window.location.pathname !== "/") {
        window.location.href = "/#registration";
        return;
      }
      window.history.pushState(null, "", "#registration");
      const target = document.getElementById("registration");
      if (target) {
        if ((window as any).__lenis) {
          (window as any).__lenis.scrollTo(target, { offset: -64, duration: 1.2 });
        } else {
          const top = target.getBoundingClientRect().top + window.pageYOffset - 64;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      window.history.pushState(null, "", href);
      const targetId = href.replace("#", "");
      const target = document.getElementById(targetId);
      if (target) {
        if ((window as any).__lenis) {
          (window as any).__lenis.scrollTo(target, { offset: -64, duration: 1.2 });
        } else {
          const top = target.getBoundingClientRect().top + window.pageYOffset - 64;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-neutral-200 py-3 shadow-xs"
            : "bg-white/80 backdrop-blur-sm py-3.5 border-b border-neutral-200/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="/"
            className="flex items-center space-x-2.5 sm:space-x-3 group focus:outline-none flex-shrink-0"
            aria-label="MadProTek Home"
          >
            <img
              src="/M-word-logo.png"
              alt="MadProTek Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-outfit font-black text-sm sm:text-base tracking-wider text-neutral-900 group-hover:text-amber-700 transition-colors leading-none">
                MADPROTEK
              </span>
              <span className="text-[9px] font-mono tracking-widest text-amber-700 uppercase font-bold mt-0.5">
                TRAIL 2026
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-xs font-mono tracking-widest text-neutral-700 font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="hover:text-amber-700 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-amber-600 hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            <a
              href="/my-ticket"
              className="inline-flex items-center px-3.5 py-1.5 border border-neutral-300 hover:border-amber-600 hover:text-amber-700 text-neutral-800 font-syne font-bold text-xs tracking-wider uppercase transition-colors rounded-sm"
            >
              <span>MY TICKET</span>
            </a>
            <a
              href="#registration"
              onClick={handleRegisterNavigation}
              className="inline-flex items-center space-x-1 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-syne font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-xs hover:scale-[1.02] rounded-sm cursor-pointer"
            >
              <span>REGISTER 4X4</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile / Tablet Actions & Menu Toggle */}
          <div className="flex items-center space-x-2 lg:hidden">
            <a
              href="#registration"
              onClick={handleRegisterNavigation}
              className="inline-flex items-center px-3 py-1 bg-amber-600 text-white font-syne font-bold text-[11px] tracking-wider uppercase rounded-sm cursor-pointer"
            >
              <span>REGISTER</span>
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-900 hover:text-amber-700 p-2 rounded focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-lg lg:hidden flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center space-x-3">
              <img src="/M-word-logo.png" alt="MadProTek Logo" className="h-8 w-auto" />
              <span className="font-outfit font-black text-white text-lg tracking-wider">
                MADPROTEK 2026
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-amber-400 p-2"
              aria-label="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col space-y-4 my-auto">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="font-syne text-xl sm:text-2xl font-bold text-white hover:text-amber-400 tracking-wider uppercase transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/my-ticket"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-syne text-xl sm:text-2xl font-bold text-amber-400 hover:text-amber-300 tracking-wider uppercase transition-colors pt-2"
            >
              MY TICKET DASHBOARD
            </a>
          </div>

          <div className="w-full pt-4 border-t border-neutral-800">
            <a
              href="#registration"
              onClick={handleRegisterNavigation}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-syne font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-lg shadow-lg cursor-pointer"
            >
              REGISTER YOUR 4X4 RIG
            </a>
            <div className="text-center text-[10px] font-mono tracking-widest text-neutral-400 mt-3">
              14–15 NOV 2026 // URIGAM PROVING GROUND
            </div>
          </div>
        </div>
      )}
    </>
  );
}
