import React from "react";
import { ShieldCheck, Crosshair, Wrench, HeartPulse, Radio, AlertCircle } from "lucide-react";

export function Safety() {
  const safetyProtocols = [
    {
      icon: Crosshair,
      title: "DEDICATED TECHNICAL MARSHALS",
      detail:
        "Every technical obstacle features dedicated chief marshals and spotters with line-of-sight communication, radio telemetry, and immediate vehicle halt authority.",
    },
    {
      icon: Wrench,
      title: "RAPID 4X4 HEAVY WINCH RECOVERY",
      detail:
        "Custom high-capacity recovery rigs equipped with 12,000+ lb electric and hydraulic winches, kinetic snatch straps, and tree-saver rigging staged along critical choke points.",
    },
    {
      icon: HeartPulse,
      title: "ON-SITE MEDICAL FIRST RESPONSE",
      detail:
        "Trauma-equipped 4x4 ambulance and paramedical crew stationed continuously on ground with direct medevac routing to Hosur emergency centers.",
    },
    {
      icon: ShieldCheck,
      title: "MANDATORY SCRUTINEERING",
      detail:
        "Strict pre-event technical inspection covering roll cages, fire suppression, 4-point harnesses, recovery points, battery hold-downs, and fluid spill containment.",
    },
  ];

  return (
    <section id="experience" className="relative w-full py-24 sm:py-32 bg-sand-50 text-neutral-900 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase mb-3 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>SAFETY // ZERO-COMPROMISE STANDARDS</span>
            </div>
            <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-neutral-950">
              PROVING GROUND<br />
              <span className="text-amber-600">SAFETY PROTOCOL</span>
            </h2>
          </div>

          <p className="font-sans text-neutral-600 text-sm sm:text-base max-w-md leading-relaxed font-medium">
            Off-roading at this technical altitude demands non-negotiable safety redundancy. We provide full-spectrum recovery, communications, and emergency backing so drivers can push their limits with confidence.
          </p>
        </div>

        {/* Live Visual Feature + Protocols Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Recovery Action Photo Card */}
          <div className="lg:col-span-5 relative rounded-sm overflow-hidden border border-neutral-200 shadow-md group min-h-[420px] flex flex-col justify-between">
            <img
              src="/images/safety-recovery.jpg"
              alt="4x4 Technical Safety Recovery Rig and Marshals"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 pointer-events-none" />

            <div className="relative z-10 p-6 flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono tracking-widest uppercase rounded-sm">
                <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>ACTIVE PATROL // MARSHAL UNIT 01</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase rounded-sm">
                HEAVY WINCH
              </span>
            </div>

            <div className="relative z-10 p-6 sm:p-8 text-white">
              <span className="text-amber-400 font-mono text-[11px] tracking-wider uppercase font-bold block mb-1">
                STANDBY RECOVERY CORRIDOR
              </span>
              <h3 className="font-outfit text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2">
                RAPID CHOKEPOINT EXTRACTION
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal mb-4">
                Dedicated support rigs with 12,500 lb electric winches, kinetic snatch straps, and trained spotters stationed along every Class 5 obstacle.
              </p>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                <span>MARSHAL RADIO: ACTIVE</span>
                <span>•</span>
                <span>MAX WINCH: 12,500 LBS</span>
                <span>•</span>
                <span>PARAMEDIC: READY</span>
              </div>
            </div>
          </div>

          {/* Protocols List */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safetyProtocols.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-6 sm:p-7 bg-white border border-neutral-200 hover:border-amber-600/60 rounded-sm shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-5">
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                        PROTOCOL // 0{index + 1}
                      </span>
                    </div>
                    <h3 className="font-outfit font-bold text-base sm:text-lg text-neutral-950 uppercase tracking-tight mb-3">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Stat Banner */}
        <div className="p-6 sm:p-8 bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse hidden sm:block" />
            <div className="text-xs font-mono tracking-wider text-neutral-800 uppercase font-semibold">
              MARSHAL DISPATCH NETWORK: <span className="text-amber-700 font-bold">CONTINUOUS RADIO LINK</span> // ZERO LATENCY
            </div>
          </div>

          <div className="text-xs font-mono tracking-widest text-amber-700 uppercase font-bold">
            ZERO COMPROMISE // MADPROTEK MARSHAL DIRECTIVE
          </div>
        </div>
      </div>
    </section>
  );
}
