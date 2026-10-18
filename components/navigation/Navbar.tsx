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
    { label: "OBSTACLES", href: "#obstacles" },
    { label: "GALLERY", href: "#gallery" },
    { label: "EXPERIENCE", href: "#experience" },
    { label: "MY TICKET", href: "/my-ticket" },
    { label: "REGISTRATION", href: "#registration" },
    { label: "CONTACT", href: "#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-neutral-200 py-3.5 shadow-sm"
            : "bg-white/60 backdrop-blur-sm py-4 border-b border-black/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="/"
            className="flex items-center space-x-3 group focus:outline-none"
            aria-label="MadProTek Home"
          >
            <img
              src="/M-word-logo.png"
              alt="MadProTek Logo"
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-outfit font-black text-base sm:text-lg tracking-wider text-neutral-900 group-hover:text-amber-700 transition-colors leading-none">
                MADPROTEK
              </span>
              <span className="text-[9px] font-mono tracking-tactical text-amber-700 uppercase font-bold mt-1">
                TRAIL 2026
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-mono tracking-widest text-neutral-700 font-medium">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-amber-700 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-amber-600 hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            <a
              href="/my-ticket"
              className="inline-flex items-center px-3.5 py-2 border border-neutral-300 hover:border-amber-600 text-neutral-800 font-syne font-bold text-xs tracking-wider uppercase transition-colors"
            >
              <span>MY TICKET</span>
            </a>
            <a
              href="#registration"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-syne font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-sm hover:scale-[1.02]"
            >
              <span>REGISTER 4X4</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-neutral-900 hover:text-amber-700 p-2 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-xl flex flex-col justify-between p-8 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/M-word-logo.png"
                alt="MadProTek Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="font-outfit font-black text-xl tracking-wider text-neutral-900">
                MADPROTEK
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-neutral-900 hover:text-amber-700 p-2"
              aria-label="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col space-y-6 my-auto">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-syne text-2xl font-bold text-neutral-900 hover:text-amber-700 tracking-wider uppercase transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="w-full">
            <a
              href="#registration"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 bg-amber-600 text-white flex items-center justify-center font-syne font-extrabold text-sm tracking-wider uppercase shadow-md"
            >
              REGISTER YOUR 4X4 RIG
            </a>
            <div className="text-center text-[10px] font-mono tracking-widest text-neutral-500 mt-4">
              14–15 NOV 2026 // URIGAM VILLAGE
            </div>
          </div>
        </div>
      )}
    </>
  );
}
