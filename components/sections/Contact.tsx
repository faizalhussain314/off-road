import React from "react";
import { MapPin, Mail, Phone, Radio, Navigation, ExternalLink } from "lucide-react";

export function Contact() {
  return (
    <footer id="contact" className="relative w-full py-24 bg-sand-200 text-neutral-900 border-t border-neutral-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/full-logo.png"
                alt="MadProTek Corp"
                className="h-14 w-auto object-contain drop-shadow-sm"
              />
            </div>
            <p className="font-satoshi text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
              South India's Premier Off-Road Technical Proving Ground. Dedicated to hardcore 4x4 precision engineering, driver recovery, and extreme terrain mastery.
            </p>
            <div className="text-[11px] font-mono text-amber-700 tracking-tactical uppercase font-bold">
              14–15 NOVEMBER 2026 // URIGAM
            </div>
          </div>

          {/* Venue & Coordinates */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-700 uppercase font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>VENUE LOCATION</span>
            </div>
            <div className="font-syne font-bold text-sm text-neutral-950">
              URIGAM VILLAGE PROVING GROUND
            </div>
            <p className="font-satoshi text-xs text-neutral-600 leading-relaxed font-medium">
              Anchetty – Denkanikottai Border Region<br />
              Krishnagiri District, Tamil Nadu<br />
              Near Hosur / Bengaluru Corridor
            </p>
            <div className="font-mono text-[10px] text-neutral-500 font-semibold">
              GPS: 12.3082° N, 77.6749° E
            </div>
          </div>

          {/* Communications */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-700 uppercase font-bold">
              <Phone className="w-3.5 h-3.5" />
              <span>MARSHAL & INQUIRY DISPATCH</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-neutral-700 font-medium">
              <div className="flex flex-col space-y-1">
                <a
                  href="mailto:madprotekcorp@gmail.com"
                  className="flex items-center space-x-2 hover:text-amber-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>madprotekcorp@gmail.com</span>
                </a>
                <a
                  href="mailto:info@madprotekcorp.com"
                  className="flex items-center space-x-2 hover:text-amber-700 transition-colors pl-5"
                >
                  <span>info@madprotekcorp.com</span>
                </a>
              </div>
              <div className="flex flex-col space-y-1 pt-1">
                <a
                  href="tel:+918489199319"
                  className="flex items-center space-x-2 hover:text-amber-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>+91 84891 99319</span>
                </a>
                <a
                  href="tel:+916374693118"
                  className="flex items-center space-x-2 hover:text-amber-700 transition-colors pl-5"
                >
                  <span>+91 63746 93118</span>
                </a>
                <a
                  href="tel:+918148321138"
                  className="flex items-center space-x-2 hover:text-amber-700 transition-colors pl-5"
                >
                  <span>+91 81483 21138</span>
                </a>
              </div>
            </div>
          </div>

          {/* Logistics / Driving Directions */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono tracking-widest text-amber-700 uppercase font-bold">
              <Navigation className="w-3.5 h-3.5" />
              <span>TRANSIT ACCESS</span>
            </div>
            <p className="font-satoshi text-xs text-neutral-600 leading-relaxed font-medium">
              65 km south from Hosur via Denkanikottai state highway. High clearance vehicle recommended for the final 6 km approach road from Anchetty checkpost.
            </p>
            <a
              href="#registration"
              className="inline-flex items-center space-x-1.5 text-xs font-mono text-amber-700 hover:text-amber-800 hover:underline uppercase tracking-wider font-bold"
            >
              <span>ACCESS PASS REQUEST</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-neutral-300 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-600 gap-4">
          <div>
            © 2026 MADPROTEK OFF-ROAD EXPERIENCES. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center space-x-6 text-[11px] tracking-wider font-semibold">
            <span>OFFICIAL PROVING GROUND</span>
            <span>•</span>
            <span>ZERO COMPROMISE SAFETY</span>
            <span>•</span>
            <a
              href="/admin"
              className="text-amber-700 hover:text-amber-800 hover:underline font-bold inline-flex items-center space-x-1"
            >
              <span>MARSHAL CONSOLE</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
