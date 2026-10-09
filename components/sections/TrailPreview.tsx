import React from "react";
import { AlertTriangle, Mountain, ShieldAlert, Zap, Compass, CheckCircle2 } from "lucide-react";

export function TrailPreview() {
  const obstacles = [
    {
      id: "01",
      name: "ROCK CRAWL",
      rating: "CLASS 5",
      type: "Natural Granite Boulder Field",
      spec: "Min 33\" M/T Tires + Front/Rear Differential Lockers",
      description: "Jagged granite monoliths requiring crawling in 4L Low-1st gear with zero wheelspin to protect underbody skid armor.",
    },
    {
      id: "02",
      name: "ARTICULATION RIDGE",
      rating: "CLASS 4",
      type: "Technical Offset Mogul Trenches",
      spec: "Long-Travel Suspension + Extended Sway Bars",
      description: "Severe diagonal wheel drops that force opposite wheels into full compression and full droop simultaneously.",
    },
    {
      id: "03",
      name: "TECHNICAL SLALOM",
      rating: "CLASS 3",
      type: "Narrow Forest Corridor",
      spec: "Hydraulic Power Steering + Precision Spotting",
      description: "Tight boulder gates between native brush where an inch of drift results in tree contact or off-camber sliding.",
    },
    {
      id: "04",
      name: "30° SIDE INCLINE",
      rating: "CLASS 5",
      type: "Off-Camber Bedrock Shelf",
      spec: "Low Center of Gravity + Roll Cage Certified",
      description: "Lateral traverse on sheer granite ledge. Pushes the roll threshold where driver ballast and steady throttle are vital.",
    },
    {
      id: "05",
      name: "STONE GULLY",
      rating: "CLASS 4",
      type: "Natural Riverbed Boulder Trench",
      spec: "Heavy-Duty Diff Covers + High-Clearance Skid Plates",
      description: "Narrow dry ravine choked with loose river boulders that kick upward into transfer cases and driveshafts.",
    },
    {
      id: "06",
      name: "HAIRPIN TRENCH",
      rating: "CLASS 4+",
      type: "Technical Clay Switchback Trench",
      spec: "Dual-Battery Winch Ready + 4-Point Harness",
      description: "Steep 180° uphill switchback with deep clay trenches requiring dual-wheel throttle bump or winch assist.",
    },
    {
      id: "07",
      name: "35° STEEP INCLINE CLIMB",
      rating: "CLASS 5+",
      type: "Natural Loose Shale & Red Soil Ascent",
      spec: "Aggressive Beadlock Wheels + High-Torque Drivetrain",
      description: "Near-vertical assault where drivers see only sky through the windshield. Traction management is the only margin between summit and rollover.",
    },
    {
      id: "08",
      name: "VERTICAL DESCENT STEP",
      rating: "CLASS 4",
      type: "Terraced Granite Drop-Off Shelf",
      spec: "Low-Range Engine Braking + Rear Recovery Points",
      description: "Nerve-testing multi-tiered rock drop where foot brake lockup causes uncontrolled slide; purely driven on compression braking.",
    },
    {
      id: "09",
      name: "RIVERBED BOULDER RUN",
      rating: "CLASS 4+",
      type: "Natural Wet Granite & Pebble Mire",
      spec: "Sealed Breathers + High-Clearance Axle Tubes",
      description: "Low-traction riverbed crossing with unpredictable submerged boulders and wet granite step-ups.",
    },
    {
      id: "10",
      name: "LOOSE SHALE CREST",
      rating: "CLASS 5",
      type: "Natural Scree & Fractured Rock Ascent",
      spec: "Pneumatic Tyre Deflation down to 12 PSI",
      description: "Shifting scree slope requiring persistent forward momentum without high wheelspin that digs deep ruts.",
    },
    {
      id: "11",
      name: "OFFSET LOG & ROCK LEDGE",
      rating: "CLASS 4",
      type: "Technical Stepped Step-Up Ladder",
      spec: "Heavy Duty Rock Sliders + Underbody Plating",
      description: "Staggered natural rock shelves paired with timber logs demanding calculated tire placement and spotter synchronization.",
    },
    {
      id: "12",
      name: "CAMEL HUMP DUAL CREST",
      rating: "CLASS 4+",
      type: "High-Centered Breakover Apex",
      spec: "Extended Wheelbase Clearance + Skid Protection",
      description: "Back-to-back crests testing breakover angles where low-slung rigs risk stranding without momentum.",
    },
    {
      id: "13",
      name: "RED CLAY SINKHOLE",
      rating: "CLASS 5",
      type: "Natural Deep Clay Mud Chokepoint",
      spec: "Mud-Terrain Deep Lugs + Front Winch Anchor",
      description: "Unctuous South Indian red mud mire that clings to tire treads and demands aggressive wheel spin cleaning.",
    },
    {
      id: "14",
      name: "OFF-CAMBER S-BEND",
      rating: "CLASS 4+",
      type: "Technical Counter-Slope Traverse",
      spec: "Anti-Roll Bar Disconnect + Spotter Command",
      description: "Double off-camber transition requiring drivers to shift vehicle weight and trust side-slope balance.",
    },
    {
      id: "15",
      name: "THE FINAL GAUNTLET",
      rating: "CLASS EXTREME",
      type: "Multi-Surface Apex Proving Obstacle",
      spec: "Full Competition Spec Rigs Only",
      description: "The ultimate trial combining mud mire, boulder wedge, and a final 40-meter loose climb to the Urigam summit overlook.",
    },
  ];

  return (
    <section id="obstacles" className="relative w-full py-24 sm:py-32 bg-sand-100 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-tactical uppercase mb-3 font-bold">
              <Mountain className="w-4 h-4 text-amber-600" />
              <span>THE TRAIL // 15+ PROVING OBSTACLES</span>
            </div>
            <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-950 uppercase tracking-tight leading-[1.05]">
              15+ NATURAL &<br />
              <span className="text-amber-600">TECHNICAL OBSTACLES</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-neutral-700 bg-white px-4 py-3 border border-neutral-200 rounded-sm shadow-sm font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>ALL OBSTACLES SUPERVISED BY ACCREDITED CHIEF MARSHALS</span>
          </div>
        </div>

        {/* Live Visual Feature Showcase: Extreme Articulation & Rock Crawl */}
        <div className="mb-14 rounded-sm overflow-hidden border border-neutral-200 shadow-md bg-white grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] overflow-hidden group">
            <img
              src="/images/obstacle-crawl.jpg"
              alt="Extreme 4x4 rig crawling granite rocks with full articulation"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono tracking-widest uppercase rounded-sm">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>OBSTACLE SPOTLIGHT // MAXIMUM ARTICULATION</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
              <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[10px] font-mono font-bold uppercase rounded-sm inline-block mb-2">
                CLASS 5 EXTREME
              </span>
              <h3 className="font-outfit text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                SHEER BEDROCK & OFF-CAMBER RIDGE
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-300 max-w-lg mt-1 leading-relaxed">
                Opposite wheels pushed to full droop and bump compression on the Urigam granite line.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-wider uppercase font-bold mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>TECHNICAL SCRUTINEERING STANDARDS</span>
              </div>
              <h4 className="font-outfit text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-950 mb-4">
                BUILT TO CONQUER UNFORGIVING ROCK
              </h4>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium mb-6">
                Every obstacle is engineered to evaluate specific mechanical and pilot capabilities — from throttle modulation on loose shale to suspension articulation across terraced drop-offs.
              </p>

              <div className="space-y-3 font-sans text-xs text-neutral-700 font-medium">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Dual Differential Lockers strongly recommended for severe granite crawls & incline climbs</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Beadlock-capable rims permitted down to 10 PSI for maximum rock footprint</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Certified recovery anchor points front and rear required on every vehicle</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
              <div className="text-xs font-mono text-neutral-600 uppercase font-semibold">
                TERRAIN ARCHITECTURE: <span className="font-bold text-neutral-950">NATURAL BEDROCK & RED CLAY</span>
              </div>
              <a
                href="#registration"
                className="text-xs font-outfit font-bold tracking-wider uppercase text-amber-700 hover:text-amber-800 hover:underline"
              >
                VIEW ENTRY CRITERIA →
              </a>
            </div>
          </div>
        </div>

        {/* 15+ Obstacle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obstacles.map((obs) => (
            <div
              key={obs.id}
              className="bg-white border border-neutral-200 hover:border-amber-600/60 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 rounded-sm shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                  <span className="font-outfit font-black text-xl text-amber-700">
                    OBSTACLE {obs.id}
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[10px] tracking-wider uppercase font-bold rounded-sm">
                    {obs.rating}
                  </span>
                </div>

                <h3 className="font-outfit font-black text-xl sm:text-2xl text-neutral-950 uppercase tracking-tight group-hover:text-amber-700 transition-colors">
                  {obs.name}
                </h3>
                <span className="text-[11px] font-mono tracking-wider text-neutral-500 uppercase block mt-1 mb-4 font-semibold">
                  {obs.type}
                </span>

                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 font-medium">
                  {obs.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-start space-x-2 text-[11px] font-mono text-amber-800 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>{obs.spec}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
