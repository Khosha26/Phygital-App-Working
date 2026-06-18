// Living Tree — Master Experience
// Consolidates variants 1, 3, 4, 5, 9, 10. Cinematic single-page landing.

const STAGE_W = 1440;
const STAGE_H = 900;

const FACTS = {
  loc: "KIADB Aerospace Park · Bagalur · North Bengaluru",
  airport: "15 min · Kempegowda Int'l Airport",
  acres: 25,
  towers: 10,
  units: 2522,
  amenities: 60,
  openPct: 80,
  rera: "PRM/KA/RERA/1251/309/PR/260924/007084",
  estd: 1991,
};

const BHK_DATA = [
  { tag: "1 BHK", size: "576 sqft",         price: "₹48.9 L*",    priceNum: "48.9 L",   units: 404,  active: 12 },
  { tag: "2 BHK", size: "1,041–1,054 sqft", price: "₹75.0 L*",    priceNum: "75.0 L",   units: 892,  active: 38 },
  { tag: "2.5",   size: "1,135–1,143 sqft", price: "₹82.0 L*",    priceNum: "82.0 L",   units: 586,  active: 24 },
  { tag: "3 BHK", size: "1,316–1,927 sqft", price: "₹1.21 Cr*",   priceNum: "1.21 Cr",  units: 640,  active: 16 },
];

const MAIN_TILES = [
  { key: "floor",     label: "Floor Plans",  hint: "1 · 2 · 2.5 · 3 BHK",        Icon: IconFloorPlan, angle: -90 },
  { key: "advantages",label: "Advantages",   hint: "60+ amenities · 80% open",   Icon: IconAdvantages, angle: 0 },
  { key: "master",    label: "Master Plan",  hint: "25 acres · 10 towers",       Icon: IconMasterPlan, angle: 90 },
  { key: "location",  label: "Location",     hint: "Aerospace Park · Bagalur",   Icon: IconLocation,   angle: 180 },
];

const DOCK_ITEMS = [
  { key: "inventory", label: "Inventory",      hint: "Live unit availability",    Icon: IconInventory },
  { key: "tools",     label: "Tools",          hint: "EMI · cost sheet · compare",Icon: IconTools },
  { key: "brand",     label: "Brand Story",    hint: "Since 1991",                Icon: IconBrand },
  { key: "overview",  label: "Project",        hint: "Walk-through overview",     Icon: IconOverview },
  { key: "booking",   label: "Booking",        hint: "EOI · payment plan",        Icon: IconBooking },
  { key: "gre",       label: "GRE App",        hint: "Guest experience",          Icon: IconGRE },
  { key: "inquire",   label: "Talk to us",     hint: "Connect to advisor",        Icon: IconInquire },
];

// ============================================================
// useCount — animated counter
// ============================================================
const useCount = (target, { duration = 1800, delay = 0 } = {}) => {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let raf, start;
    const startTime = performance.now() + delay;
    const tick = (now) => {
      if (now < startTime) { raf = requestAnimationFrame(tick); return; }
      if (!start) start = now;
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
};

// ============================================================
// Ambient drifting leaves
// ============================================================
const AmbientLeaves = () => {
  const leaves = React.useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 16,
      duration: 22 + Math.random() * 28,
      delay: -Math.random() * 40,
      drift: (Math.random() - 0.5) * 140,
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 720 + 360,
      opacity: 0.08 + Math.random() * 0.18,
      depth: Math.random(),
    })), []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {leaves.map(l => (
        <div key={l.id} style={{
          position: "absolute",
          left: `${l.left}%`,
          top: "-40px",
          animation: `leafFall ${l.duration}s linear ${l.delay}s infinite`,
          "--driftX": `${l.drift}px`,
          "--rotS": `${l.rotateStart}deg`,
          "--rotE": `${l.rotateEnd}deg`,
          opacity: l.opacity,
          filter: `blur(${(1 - l.depth) * 1.5}px)`,
        }}>
          <Leaf size={l.size} fill="#d9b27a" />
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Animated brand mark — draws itself in
// ============================================================
const AnimatedTreeMark = ({ size = 56, color = "#d9b27a", strokeWidth = 1.2, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
       style={{ filter: `drop-shadow(0 0 12px ${color}40)` }}>
    {[
      <circle key="a" cx="32" cy="24" r="16" pathLength="100" />,
      <circle key="b" cx="20" cy="20" r="9" pathLength="100" />,
      <circle key="c" cx="44" cy="20" r="9" pathLength="100" />,
      <circle key="d" cx="32" cy="14" r="9" pathLength="100" />,
      <path key="e" d="M32 38 L32 58" pathLength="100" />,
      <path key="f" d="M32 46 L26 50" pathLength="100" />,
      <path key="g" d="M32 50 L38 54" pathLength="100" />,
    ].map((el, i) => React.cloneElement(el, {
      style: animate ? {
        strokeDasharray: 100,
        strokeDashoffset: 100,
        animation: `treeDraw 1.4s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 + i * 0.15}s forwards`,
      } : {},
    }))}
  </svg>
);

// ============================================================
// Central compass medallion + 4 orbiting tiles
// ============================================================
const Compass = ({ activeTile, setActiveTile }) => {
  const R = 162; // orbit radius
  const TILE = 104;

  return (
    <div style={{
      position: "relative", width: R * 2 + TILE + 40, height: R * 2 + TILE + 40,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* breathing rings */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          position: "absolute",
          width: 168 + i * 42, height: 168 + i * 42,
          borderRadius: "50%",
          border: `1px ${i === 1 ? "solid" : "dashed"} rgba(217,178,122,${0.35 - i * 0.08})`,
          animation: `breathe 6s ease-in-out ${i * 0.4}s infinite`,
        }}/>
      ))}

      {/* dotted connector lines drawn with SVG */}
      <svg style={{ position: "absolute", width: R * 2 + 100, height: R * 2 + 100, pointerEvents: "none" }}>
        {MAIN_TILES.map((t, i) => {
          const rad = (t.angle * Math.PI) / 180;
          const cx = (R * 2 + 100) / 2;
          const cy = (R * 2 + 100) / 2;
          const x2 = cx + R * Math.cos(rad);
          const y2 = cy + R * Math.sin(rad);
          return (
            <line key={t.key}
              x1={cx} y1={cy} x2={x2} y2={y2}
              stroke="rgba(217,178,122,0.22)"
              strokeWidth="1"
              strokeDasharray="3 5"
              style={{
                strokeDasharray: "3 5",
                strokeDashoffset: 1000,
                animation: `dashIn 2s linear ${1.5 + i * 0.2}s forwards`,
              }}
            />
          );
        })}
      </svg>

      {/* center medallion */}
      <div style={{
        position: "relative", zIndex: 2,
        width: 142, height: 142, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, #2c4030 0%, #1a2620 60%, #0f1813 100%)",
        border: "1px solid rgba(217,178,122,0.4)",
        boxShadow: "inset 0 0 80px rgba(217,178,122,0.1), 0 30px 80px rgba(0,0,0,0.6)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: "scaleFadeIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards",
      }}>
        <AnimatedTreeMark size={42} color="#d9b27a" />
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: 15, marginTop: 4, color: "#d9b27a", lineHeight: 1,
          whiteSpace: "nowrap",
          opacity: 0, animation: "fadeIn 0.8s ease 1.6s forwards",
        }}>
          {activeTile ? activeTile.label : "est. here"}
        </div>
        <div style={{
          fontSize: 8.5, letterSpacing: 2, marginTop: 6, opacity: 0, color: "#f4ead8",
          textTransform: "uppercase", lineHeight: 1, whiteSpace: "nowrap",
          animation: "fadeInOpacity 0.8s ease 1.8s forwards",
        }}>
          {activeTile ? activeTile.hint : "13.13°N · 77.65°E"}
        </div>
      </div>

      {/* orbiting tiles */}
      {MAIN_TILES.map((t, i) => {
        const rad = (t.angle * Math.PI) / 180;
        const x = R * Math.cos(rad);
        const y = R * Math.sin(rad);
        const isActive = activeTile?.key === t.key;
        return (
          <div key={t.key}
            onMouseEnter={() => setActiveTile(t)}
            onMouseLeave={() => setActiveTile(null)}
            style={{
              position: "absolute",
              left: "50%", top: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              cursor: "pointer",
              opacity: 0,
              animation: `fadeIn 0.6s ease ${1.0 + i * 0.12}s forwards`,
            }}>
            <div style={{
              width: TILE, height: TILE, borderRadius: "50%",
              animation: `springIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${1.0 + i * 0.12}s backwards`,
              willChange: "transform",
              background: isActive
                ? "linear-gradient(135deg, rgba(217,178,122,0.92), rgba(184,140,82,0.85))"
                : "rgba(255,255,255,0.06)",
              border: `1px solid ${isActive ? "rgba(217,178,122,0.8)" : "rgba(217,178,122,0.35)"}`,
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isActive
                ? "0 25px 60px rgba(217,178,122,0.4), inset 0 1px 0 rgba(255,255,255,0.25)"
                : "0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              transform: isActive ? "scale(1.08)" : "scale(1)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              <t.Icon size={44} stroke={isActive ? "#1a2620" : "#f4ead8"} strokeWidth={1.3} />
            </div>
            <div style={{
              textAlign: "center", marginTop: 8,
              fontSize: 10.5, fontWeight: 600, color: "#f4ead8",
              whiteSpace: "nowrap",
              letterSpacing: 0.5, textTransform: "uppercase",
              opacity: isActive ? 1 : 0.85,
              transition: "opacity 0.3s",
            }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// Live stat rail with counters
// ============================================================
const StatRail = () => {
  const acres   = useCount(FACTS.acres,     { duration: 1400, delay: 400 });
  const towers  = useCount(FACTS.towers,    { duration: 1400, delay: 500 });
  const units   = useCount(FACTS.units,     { duration: 1800, delay: 600 });
  const amen    = useCount(FACTS.amenities, { duration: 1400, delay: 700 });
  const open    = useCount(FACTS.openPct,   { duration: 1400, delay: 800 });

  const items = [
    { v: acres.toFixed(0),       u: "acres",      l: "Land" },
    { v: towers.toFixed(0),       u: "towers",     l: "G + 23 each" },
    { v: Math.round(units).toLocaleString("en-IN"), u: "homes", l: "1·2·2.5·3 BHK" },
    { v: amen.toFixed(0) + "+",   u: "amenities",  l: "2 clubhouses" },
    { v: open.toFixed(0) + "%",   u: "open",       l: "Green spaces" },
  ];
  const fs = { num: 28, unit: 13, lbl: 9 };
  return (
    <div style={{
      display: "flex", gap: 0,
      animation: "fadeUp 1s ease 0.6s backwards",
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          flex: 1, padding: "0 22px",
          borderLeft: i === 0 ? "none" : "1px solid rgba(217,178,122,0.18)",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: fs.num, fontWeight: 500, color: "#f4ead8", lineHeight: 1,
            letterSpacing: -0.5,
          }}>
            {it.v}<span style={{ fontSize: fs.unit, color: "#d9b27a", marginLeft: 5, fontStyle: "italic" }}>{it.u}</span>
          </div>
          <div style={{
            fontSize: fs.lbl, letterSpacing: 2.5, textTransform: "uppercase",
            color: "rgba(244,234,216,0.55)", marginTop: 4,
          }}>
            {it.l}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// BHK configurator strip
// ============================================================
const BHKConfigurator = ({ active, setActive }) => {
  const bhk = BHK_DATA[active];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 24,
      background: "rgba(15,24,19,0.7)",
      border: "1px solid rgba(217,178,122,0.22)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      padding: "18px 24px", borderRadius: 999,
      animation: "fadeUp 1s ease 1.4s backwards",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(244,234,216,0.55)", textTransform: "uppercase" }}>
        Configure
      </div>
      <div style={{ display: "flex", gap: 4, background: "rgba(217,178,122,0.06)", borderRadius: 999, padding: 4 }}>
        {BHK_DATA.map((b, i) => (
          <button key={b.tag} onClick={() => setActive(i)} style={{
            background: i === active ? "#d9b27a" : "transparent",
            color: i === active ? "#1a2620" : "#f4ead8",
            border: "none", padding: "8px 16px", borderRadius: 999,
            fontSize: 12, fontWeight: 600, letterSpacing: 0.4, cursor: "pointer",
            transition: "all 0.25s",
          }}>{b.tag}</button>
        ))}
      </div>
      <div style={{ height: 36, width: 1, background: "rgba(217,178,122,0.18)" }}/>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, color: "#f4ead8", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.55 }}>From</span>
        <span key={bhk.tag} style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: "#d9b27a",
          animation: "fadeUp 0.4s ease",
        }}>{bhk.price}</span>
        <span style={{ fontSize: 11.5, opacity: 0.55 }}>· {bhk.size}</span>
      </div>
      <div style={{ height: 36, width: 1, background: "rgba(217,178,122,0.18)" }}/>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11, color: "#f4ead8", minWidth: 140 }}>
        <div style={{ opacity: 0.55, letterSpacing: 2, textTransform: "uppercase", fontSize: 9.5 }}>Available now</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#7fb955",
            boxShadow: "0 0 10px #7fb955", animation: "pulse 1.6s ease-in-out infinite",
          }}/>
          <span><b>{bhk.units}</b> units · <b style={{ color: "#d9b27a" }}>{bhk.active}</b> being viewed</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
function LivingTreeExperience() {
  const [bhk, setBhk] = React.useState(1);
  const [activeTile, setActiveTile] = React.useState(null);
  const [hoveredDock, setHoveredDock] = React.useState(null);
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div style={{
      width: STAGE_W, height: STAGE_H, position: "relative", overflow: "hidden",
      fontFamily: "Inter, sans-serif", color: "#f4ead8",
      background: "#0a120d",
    }}>
      {/* faint canopy backdrop (variant 4) */}
      <div className="canopyBg" style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1800&q=80&auto=format&fit=crop)`,
        backgroundSize: "cover", backgroundPosition: "center 35%",
      }}/>
      {/* darkening + green tint */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(10,18,13,0.78) 0%, rgba(10,18,13,0.65) 35%, rgba(10,18,13,0.78) 65%, rgba(10,18,13,0.95) 100%)",
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 0%, rgba(10,18,13,0.5) 70%)",
      }}/>

      <AmbientLeaves />

      {/* TOP BAR */}
      <div style={{
        position: "absolute", top: 28, left: 48, right: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeDown 0.8s ease backwards",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <AnimatedTreeMark size={38} color="#d9b27a" strokeWidth={1.3} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, letterSpacing: 0.4 }}>
              Living<em style={{ fontStyle: "italic", color: "#d9b27a" }}>Tree</em>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.55, marginTop: 3, textTransform: "uppercase" }}>
              by Kalyani Developers · est. {FACTS.estd}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
          <div style={{
            padding: "8px 14px", border: "1px solid rgba(217,178,122,0.3)", borderRadius: 999,
            letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(244,234,216,0.75)",
            display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d9b27a" }}/>
            RERA · 1251/309
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["EN", "ಕ", "हि"].map((l, i) => (
              <button key={l} style={{
                width: 34, height: 34, borderRadius: "50%",
                background: i === 0 ? "rgba(217,178,122,0.15)" : "transparent",
                border: "1px solid rgba(217,178,122,0.25)",
                color: "#f4ead8", fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "5px 14px 5px 5px",
            background: "linear-gradient(135deg, rgba(217,178,122,0.18), rgba(217,178,122,0.06))",
            border: "1px solid rgba(217,178,122,0.35)",
            borderRadius: 999, whiteSpace: "nowrap",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #d9b27a, #b9874a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#1a2620",
            }}>PR</div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>Priya · Your GRE</div>
              <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: 0.5 }}>Online · {timeStr} IST</div>
            </div>
          </div>
        </div>
      </div>

      {/* HEADLINE */}
      <div style={{
        position: "absolute", top: 100, left: 0, right: 0, textAlign: "center",
        zIndex: 5,
      }}>
        <div style={{
          fontSize: 10.5, letterSpacing: 6, color: "#d9b27a",
          textTransform: "uppercase", opacity: 0, animation: "fadeIn 0.8s ease 0.2s forwards",
        }}>
          {FACTS.loc}
        </div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
          fontSize: 40, lineHeight: 1.05, margin: "12px 0 0", letterSpacing: -0.3,
          whiteSpace: "nowrap",
        }}>
          <span style={{
            display: "inline-block", opacity: 0,
            animation: "fadeUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards",
          }}>A residence, rooted&nbsp;<em style={{
            fontStyle: "italic", color: "#d9b27a",
            animation: "fadeUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.6s backwards",
          }}>where Bengaluru breathes.</em></span>
        </h1>
      </div>

      {/* COMPASS — center stage */}
      <div style={{
        position: "absolute", top: 210, left: "50%", transform: "translateX(-50%)",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}>
        <Compass activeTile={activeTile} setActiveTile={setActiveTile} />
      </div>

      {/* STAT RAIL */}
      <div style={{
        position: "absolute", top: 716, left: 80, right: 80, height: 48,
        background: "linear-gradient(180deg, rgba(15,24,19,0.5), rgba(15,24,19,0.3))",
        border: "1px solid rgba(217,178,122,0.15)",
        borderRadius: 12, padding: "16px 24px",
        display: "flex", alignItems: "center",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      }}>
        <StatRail />
      </div>

      {/* SECONDARY DOCK */}
      <div style={{
        position: "absolute", top: 786, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 8,
        animation: "fadeUp 1s ease 1.2s backwards",
      }}>
        {DOCK_ITEMS.map((d, i) => {
          const hov = hoveredDock === d.key;
          return (
            <div key={d.key}
              onMouseEnter={() => setHoveredDock(d.key)}
              onMouseLeave={() => setHoveredDock(null)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: hov ? "6px 14px 6px 6px" : 6,
                background: hov ? "rgba(217,178,122,0.18)" : "rgba(244,234,216,0.04)",
                border: `1px solid ${hov ? "rgba(217,178,122,0.5)" : "rgba(244,234,216,0.14)"}`,
                borderRadius: 999,
                cursor: "pointer",
                transition: "all 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(14px)",
              }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: hov ? "#d9b27a" : "rgba(217,178,122,0.18)",
                color: hov ? "#1a2620" : "#d9b27a",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.32s",
              }}>
                <d.Icon size={20} stroke="currentColor" sw={1.4}/>
              </div>
              <div style={{
                overflow: "hidden",
                maxWidth: hov ? 200 : 0,
                opacity: hov ? 1 : 0,
                transition: "all 0.32s",
                whiteSpace: "nowrap",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.3, color: "#f4ead8" }}>{d.label}</div>
                <div style={{ fontSize: 10, opacity: 0.65, marginTop: 1 }}>{d.hint}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BHK + CTA STRIP */}
      <div style={{
        position: "absolute", bottom: 24, left: 32, right: 32,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <BHKConfigurator active={bhk} setActive={setBhk} />
        <div style={{
          display: "flex", gap: 12, animation: "fadeUp 1s ease 1.5s backwards",
        }}>
          <button style={{
            background: "transparent", color: "#f4ead8",
            border: "1px solid rgba(217,178,122,0.4)",
            padding: "12px 18px", borderRadius: 999, fontSize: 12, fontWeight: 500,
            letterSpacing: 0.5, cursor: "pointer", whiteSpace: "nowrap",
          }}>Download brochure</button>
          <button style={{
            background: "linear-gradient(135deg, #d9b27a, #b9874a)",
            color: "#1a2620", border: "none",
            padding: "12px 22px", borderRadius: 999, fontSize: 13, fontWeight: 700,
            whiteSpace: "nowrap",
            letterSpacing: 0.5, cursor: "pointer",
            boxShadow: "0 16px 36px rgba(217,178,122,0.3)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            Begin the tour
            <span style={{
              display: "inline-block",
              animation: "nudge 1.6s ease-in-out infinite",
            }}>→</span>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        position: "absolute", bottom: 6, left: 32, right: 32,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 9.5, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45,
      }}>
        <span>Possession Sep 2029 · Phase 1 booking open</span>
        <span>{FACTS.airport}</span>
        <span>Sales Pavilion · Gate A · {timeStr}</span>
      </div>
    </div>
  );
}

Object.assign(window, { LivingTreeExperience, STAGE_W, STAGE_H });
