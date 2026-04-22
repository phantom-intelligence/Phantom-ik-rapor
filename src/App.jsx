import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js'; // 🚀 EKLENDİ: Supabase Kütüphanesi
import {
  ChevronDown, BarChart3, LayoutGrid, Table, GitCompare, X,
  Phone, Mail, Search, Users, Star, TrendingUp, UserX,
  Loader2, Lock, MessageSquare, FileText,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

// 🔌 SUPABASE MOTOR BAĞLANTISI (EKLENDİ)
const supabaseUrl = 'https://qrwqjitxdzouyaluhabh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd3FqaXR4ZHpvdXlhbHVoYWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODk5MjIsImV4cCI6MjA5MTc2NTkyMn0.6U7X8o-0w8EdJTNYZTx-LejFVboYHZo6mHpBZjWu-p8'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// ═══════════════════════════════════════════════════════════
//  DESIGN TOKENS (website aligned)
// ═══════════════════════════════════════════════════════════
const T = {
  bg: "#080A07",
  surface: "#000000",
  surfaceRaised: "#0E110D",
  text: "#F5F4F1",
  textDim: "rgba(245,244,241,0.88)",
  muted: "#878A80",
  faint: "#5C5F58",
  border: "rgba(245,244,241,0.06)",
  borderStrong: "rgba(245,244,241,0.12)",
  borderAccent: "rgba(217,91,0,0.22)",
  borderAccentStrong: "rgba(217,91,0,0.4)",
  accent: "#D95B00",
  accentBright: "#FF7A1F",
  accentGlow: "rgba(217,91,0,0.08)",
  // Status — kept for data viz (information carrying)
  strong: "#16A34A",
  strongDim: "rgba(22,163,74,0.12)",
  medium: "#D97706",
  mediumDim: "rgba(217,119,6,0.12)",
  weak: "#B45350",
  weakDim: "rgba(180,83,80,0.1)",
  // Star gold — kept for score, score-only
  goldSolid: "#D4AF37",
  goldGrad: "linear-gradient(135deg, #CFAD58, #EED18D, #B88E33)",
  goldTextGrad: "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)",
};

const MAKS = { D: 25, Y: 40, K: 20, E: 15 };
const ETIKETLER = { D: "Deneyim", Y: "Yetkinlik", K: "Kariyer İstikrarı", E: "Eğitim" };
const DEPT_RENK = {
  "Bilgi Teknolojileri": "#2563EB",
  "Finans & Muhasebe": "#059669",
  "Satış": T.accent,
  "Pazarlama": "#7C3AED",
  "Mühendislik": "#0891B2",
  "Müşteri Hizmetleri": "#DC2626",
  "Lojistik & Operasyon": "#475569",
  "İnsan Kaynakları": "#D97706",
  "Üretim & Kalite": "#0D9488",
  "Hukuk": "#6D28D9",
};

// Font stacks
const F_DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const F_BODY = "'Plus Jakarta Sans', 'Inter', sans-serif";
const F_MONO = "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace";

// ═══════════════════════════════════════════════════════════
//  HELPERS (unchanged logic, keep exact behavior)
// ═══════════════════════════════════════════════════════════
function yuzde(v, m) {
  const r = (v / m) * 100;
  return r - Math.floor(r) >= 0.5 ? Math.ceil(r) : Math.floor(r);
}

function puanRengi(p, d) {
  if (d === "yildiz") return T.goldSolid;
  if (d === "elendi") return T.weak;
  if (p >= 60) return T.strong;
  if (p >= 40) return T.medium;
  return T.weak;
}
function barRengi(y) { if (y >= 70) return T.strong; if (y >= 40) return T.medium; return T.weak; }

function isYildiz(a) {
  if (a.elendi) return false;
  if (!a.puanDetay) return false;
  return a.puan >= 80 && (a.puanDetay.Y / MAKS.Y) * 100 >= 75;
}

function borderRengi(a) {
  if (a.durum === "yildiz") return "yildiz";
  if (a.durum === "elendi") return T.weak;
  if (a.puan >= 60) return T.strong;
  return T.medium;
}
function grupla(adaylar) {
  const groups = []; let cur = null;
  adaylar.forEach((a) => {
    const br = borderRengi(a);
    if (!cur || cur.renk !== br) { cur = { renk: br, adaylar: [a] }; groups.push(cur); }
    else cur.adaylar.push(a);
  });
  return groups;
}
const GOLD_BORDER_GRAD = "linear-gradient(180deg, #C9952C 0%, #DFC070 15%, #F5E6A3 35%, #D4AF37 50%, #F5E6A3 65%, #DFC070 85%, #C9952C 100%)";

function ozetKisa(text) {
  if (!text) return "";
  const dot = text.indexOf(".");
  if (dot > 0 && dot < 100) return text.substring(0, dot + 1);
  if (text.length > 100) return text.substring(0, 100) + "...";
  return text;
}

function deptSiralama(aday, tumAdaylar) {
  const deptAdaylar = tumAdaylar.filter((a) => a.departman === aday.departman).sort((a, b) => b.puan - a.puan);
  const sira = deptAdaylar.findIndex((a) => a.id === aday.id) + 1;
  return { sira, toplam: deptAdaylar.length };
}

function riskBayraklari(aday) {
  const flags = [];
  if (!aday.puanDetay) return flags;
  const yY = yuzde(aday.puanDetay.Y, MAKS.Y);
  const yD = yuzde(aday.puanDetay.D, MAKS.D);
  const yK = yuzde(aday.puanDetay.K, MAKS.K);
  const yE = yuzde(aday.puanDetay.E, MAKS.E);
  const yuzdes = [yD, yY, yK, yE];
  if (yY < 40) flags.push({ tip: "risk", metin: "Düşük yetkinlik" });
  if (yD < 40) flags.push({ tip: "risk", metin: "Deneyim yetersiz" });
  if (yK < 50) flags.push({ tip: "risk", metin: "Kariyer istikrarsızlığı" });
  if ((aday.yetkinlikler || []).length <= 2 && !aday.elendi) flags.push({ tip: "risk", metin: "Yetkinlik çeşitliliği düşük" });
  const mx = Math.max(...yuzdes), mn = Math.min(...yuzdes);
  if (mx - mn >= 50) flags.push({ tip: "risk", metin: "Dengesiz profil" });
  const den = parseInt(aday.deneyim || 0);
  if (den <= 2 && (aday.pozisyon || "").toLowerCase().includes("kıdemli")) flags.push({ tip: "risk", metin: "Deneyim-kıdem uyumsuzluğu" });
  if (!aday.elendi && aday.puan >= 75 && aday.puan <= 79) {
    const yetYuzde = (aday.puanDetay.Y / MAKS.Y) * 100;
    if (yetYuzde >= 75) flags.push({ tip: "pozitif", metin: "Yıldız eşiğine yakın" });
    else flags.push({ tip: "uyari", metin: "Yıldız eşiğine yakın — yetkinlik yetersiz" });
  }
  const hasRisk = flags.length > 0;
  if (yD === 100) flags.push({ tip: "pozitif", metin: "Deneyim maksimum" });
  if (yY >= 75 && !((aday.yetkinlikler || []).length <= 2)) flags.push({ tip: "pozitif", metin: "Yetkinlik güçlü" });
  if (yK >= 90) flags.push({ tip: "pozitif", metin: "Kariyer istikrarlı" });
  if ((aday.yetkinlikler || []).length >= 3 && !aday.elendi) flags.push({ tip: "pozitif", metin: "Geniş yetkinlik seti" });
  if (mx - mn <= 20 && !aday.elendi && !hasRisk) flags.push({ tip: "pozitif", metin: "Dengeli profil" });
  return flags;
}

function metalikPuanStyle(isGold) {
  if (!isGold) return {};
  return { background: T.goldTextGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
}

// ═══════════════════════════════════════════════════════════
//  UI PRIMITIVES
// ═══════════════════════════════════════════════════════════

// Editorial section label — orange line + uppercase mono
function SectionLabel({ children, style = {} }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, ...style }}>
      <span style={{ display: "inline-block", width: 22, height: 1, background: T.accent }} />
      <span style={{ fontFamily: F_MONO, fontSize: 10, color: T.accent, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 500 }}>
        {children}
      </span>
    </div>
  );
}

// Dot accent on heading periods (orange "." )
function DotAccent() {
  return <span style={{ color: T.accent, marginLeft: 1 }}>.</span>;
}

// Mini phantom/intelligence breath logo — mount reveal + hover pulse
function PhantomBreath({ variant = "header" }) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const size = variant === "header" ? 12 : 10;
  const color = T.muted;

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: F_MONO,
        fontSize: size,
        letterSpacing: "0.04em",
        color,
        cursor: "default",
      }}
    >
      <span
        style={{
          display: "inline-block",
          color: T.accent,
          fontWeight: 600,
          transform: mounted ? "skewX(-15deg) translateX(0)" : "skewX(-15deg) translateX(-4px)",
          opacity: mounted ? 1 : 0,
          transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease",
          filter: hovered ? "drop-shadow(0 0 4px rgba(217,91,0,0.6))" : "none",
          margin: "0 2px",
        }}
      >
        /
      </span>
      <span
        style={{
          display: "inline-block",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(-3px)",
          transition: "opacity 0.6s ease 0.15s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s",
        }}
      >
        phantom
      </span>
      <span
        style={{
          display: "inline-block",
          opacity: mounted ? 0.75 : 0,
          transform: mounted ? "translateX(0)" : "translateX(-3px)",
          transition: "opacity 0.6s ease 0.3s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s",
        }}
      >
        intelligence
      </span>
    </span>
  );
}

// Circular progress — unchanged structure, website-token colors
function CircularProgress({ puan, renk, isGold, size = 60 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (puan / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.borderStrong} strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isGold ? T.goldSolid : renk} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease", filter: isGold ? "drop-shadow(0 0 6px rgba(212,175,55,0.5))" : "none" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: F_MONO, fontSize: 17, fontWeight: 600, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums", color: isGold ? undefined : renk, ...metalikPuanStyle(isGold) }}>{puan}</span>
      </div>
    </div>
  );
}

function MiniRadar({ puanDetay, renk, isGold }) {
  const data = Object.entries(MAKS).map(([k, m]) => ({ kriter: ETIKETLER[k], value: yuzde(puanDetay[k], m), fullMark: 100 }));
  const fillColor = isGold ? T.goldSolid : renk;
  return (
    <div style={{ width: 200, height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius={65}>
          <PolarGrid stroke={T.borderStrong} gridType="polygon" />
          <PolarAngleAxis dataKey="kriter" tick={{ fontSize: 10, fill: T.muted, fontFamily: F_MONO, letterSpacing: "0.05em" }} />
          <Radar dataKey="value" stroke={fillColor} fill={fillColor} fillOpacity={0.14} strokeWidth={1.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComparisonRadar({ a, b }) {
  const data = Object.entries(MAKS).map(([k, m]) => ({ kriter: ETIKETLER[k], valueA: yuzde(a.puanDetay[k], m), valueB: yuzde(b.puanDetay[k], m), fullMark: 100 }));
  const renkA = puanRengi(a.puan, a.durum);
  const renkB = puanRengi(b.puan, b.durum);
  return (
    <div style={{ width: "100%", height: 240, marginBottom: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius={85}>
          <PolarGrid stroke={T.borderStrong} gridType="polygon" />
          <PolarAngleAxis dataKey="kriter" tick={{ fontSize: 10, fill: T.muted, fontFamily: F_MONO, letterSpacing: "0.05em" }} />
          <Radar name={a.isim} dataKey="valueA" stroke={a.durum === "yildiz" ? T.goldSolid : renkA} fill={a.durum === "yildiz" ? T.goldSolid : renkA} fillOpacity={0.14} strokeWidth={1.5} />
          <Radar name={b.isim} dataKey="valueB" stroke={b.durum === "yildiz" ? T.goldSolid : renkB} fill={b.durum === "yildiz" ? T.goldSolid : renkB} fillOpacity={0.14} strokeWidth={1.5} />
        </RadarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 4 }}>
        <span style={{ fontFamily: F_MONO, fontSize: 11, color: a.durum === "yildiz" ? T.goldSolid : renkA, fontWeight: 500, letterSpacing: "0.05em" }}>{a.isim}</span>
        <span style={{ color: T.faint }}>vs</span>
        <span style={{ fontFamily: F_MONO, fontSize: 11, color: b.durum === "yildiz" ? T.goldSolid : renkB, fontWeight: 500, letterSpacing: "0.05em" }}>{b.isim}</span>
      </div>
    </div>
  );
}

// Dashboard tile — editorial treatment (eyebrow · number · delta)
function DashKart({ num, baslik, deger, renk, alt, delta, ikon, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="dash-tile"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 160px",
        minWidth: 150,
        background: T.surface,
        border: `1px solid ${hovered ? T.borderStrong : T.border}`,
        borderRadius: 16,
        padding: "22px 20px",
        fontFamily: F_BODY,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        animation: `fadeSlideIn 0.5s ease ${delay}ms both`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: F_MONO, fontSize: 10, color: T.accent, letterSpacing: "0.15em", fontWeight: 500 }}>{num}</span>
        <span style={{ color: renk, opacity: 0.8, display: "flex" }}>{ikon}</span>
      </div>
      <div style={{ fontFamily: F_MONO, fontSize: 10, color: T.muted, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>
        {baslik}
      </div>
      <div style={{ fontFamily: F_DISPLAY, fontSize: 40, fontWeight: 500, color: T.text, lineHeight: 1, letterSpacing: "-0.025em", fontVariationSettings: '"opsz" 72' }}>
        {deger}
      </div>
      {alt && (
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 10, fontWeight: 400, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{alt}</span>
          {delta !== undefined && (
            <span style={{ fontFamily: F_MONO, fontSize: 10, color: delta > 0 ? T.strong : delta < 0 ? T.weak : T.muted, fontWeight: 500, letterSpacing: "0.04em" }}>
              {delta > 0 ? "+" : ""}{delta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  COMPARISON MODAL — backdrop-blur + rounded + accent border
// ═══════════════════════════════════════════════════════════
function Karsilastir({ adaylar, kapat }) {
  const [a, b] = adaylar;
  const ks = Object.keys(MAKS);
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(8,10,7,0.78)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, fontFamily: F_BODY, animation: "fadeIn 0.25s ease",
      }}
      onClick={kapat}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          border: `1px solid ${T.borderAccent}`,
          borderRadius: 20,
          maxWidth: 720, width: "100%", maxHeight: "90vh", overflow: "auto",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,91,0,0.05)",
          animation: "modalSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div style={{ padding: "22px 28px 20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <SectionLabel>Karşılaştırma</SectionLabel>
            <div style={{ fontFamily: F_DISPLAY, fontSize: 22, fontWeight: 500, color: T.text, marginTop: 10, letterSpacing: "-0.02em" }}>
              {a.isim} <span style={{ color: T.faint, fontFamily: F_MONO, fontSize: 16, margin: "0 8px" }}>→</span> {b.isim}<DotAccent />
            </div>
          </div>
          <button onClick={kapat} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 8, display: "flex" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 28 }}>
          <ComparisonRadar a={a} b={b} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 0, marginTop: 8 }}>
            <div style={{ padding: 14, background: T.surfaceRaised, borderRadius: "8px 0 0 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 31, fontWeight: 500, fontFamily: F_MONO, fontVariantNumeric: "tabular-nums", color: puanRengi(a.puan, a.durum), letterSpacing: "-0.02em", textAlign: "center", ...metalikPuanStyle(a.durum === "yildiz") }}>{a.puan}</div>
            </div>
            <div style={{ padding: 14, background: T.surfaceRaised, borderBottom: `1px solid ${T.border}`, fontFamily: F_MONO, fontSize: 9, color: T.faint, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, letterSpacing: "0.18em" }}>
              PUAN
            </div>
            <div style={{ padding: 14, background: T.surfaceRaised, borderRadius: "0 8px 0 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 31, fontWeight: 500, fontFamily: F_MONO, fontVariantNumeric: "tabular-nums", color: puanRengi(b.puan, b.durum), letterSpacing: "-0.02em", textAlign: "center", ...metalikPuanStyle(b.durum === "yildiz") }}>{b.puan}</div>
            </div>
            {ks.map((k) => {
              const va = a.puanDetay[k], vb = b.puanDetay[k];
              const ya = yuzde(va, MAKS[k]), yb = yuzde(vb, MAKS[k]);
              const wA = va > vb, wB = vb > va;
              return [
                <div key={k + "a"} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: F_MONO, fontSize: 13, fontWeight: wA ? 600 : 400, color: wA ? T.strong : T.muted, fontVariantNumeric: "tabular-nums" }}>{va}/{MAKS[k]} <span style={{ fontSize: 11, color: T.faint }}>%{ya}</span></div>
                  <div style={{ height: 3, background: T.borderStrong, borderRadius: 2, marginTop: 8 }}>
                    <div style={{ width: `${ya}%`, height: "100%", background: barRengi(ya), borderRadius: 2, transition: "width 0.5s ease" }} />
                  </div>
                </div>,
                <div key={k + "m"} style={{ padding: "12px 4px", borderBottom: `1px solid ${T.border}`, fontFamily: F_MONO, fontSize: 9, color: T.faint, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, letterSpacing: "0.14em" }}>
                  {ETIKETLER[k].substring(0, 3).toUpperCase()}
                </div>,
                <div key={k + "b"} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: F_MONO, fontSize: 13, fontWeight: wB ? 600 : 400, color: wB ? T.strong : T.muted, fontVariantNumeric: "tabular-nums" }}>{vb}/{MAKS[k]} <span style={{ fontSize: 11, color: T.faint }}>%{yb}</span></div>
                  <div style={{ height: 3, background: T.borderStrong, borderRadius: 2, marginTop: 8 }}>
                    <div style={{ width: `${yb}%`, height: "100%", background: barRengi(yb), borderRadius: 2, transition: "width 0.5s ease" }} />
                  </div>
                </div>,
              ];
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  CANDIDATE CARD — cursor spotlight + editorial typography
// ═══════════════════════════════════════════════════════════
function AdayKart({ aday, acik, toggle, karsilastirSecili, karsilastirToggle, isLast, animDelay = 0, tumAdaylar = [] }) {
  const renk = puanRengi(aday.puan, aday.durum);
  const secili = karsilastirSecili;
  const isGold = aday.durum === "yildiz";
  const isElendi = aday.durum === "elendi";
  const [hovered, setHovered] = useState(false);
  const [sorularAcik, setSorularAcik] = useState(false);
  const cardRef = useRef(null);

  function handleMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  const sira = deptSiralama(aday, tumAdaylar);

  return (
    <div
      ref={cardRef}
      className="aday-kart"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        backgroundColor: secili ? "rgba(217,91,0,0.04)" : T.surface,
        borderBottom: isLast ? "none" : `1px solid ${T.border}`,
        transition: "background-color 0.25s ease",
        cursor: "pointer",
        fontFamily: F_BODY,
        animation: `fadeSlideIn 0.4s ease ${animDelay}ms both`,
        opacity: isElendi ? 0.72 : 1,
        position: "relative",
      }}
    >
      {/* cursor spotlight */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), ${T.accentGlow}, transparent 55%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
        }}
      />
      <div onClick={toggle} style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 0 22px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <ChevronDown size={13} color={T.muted} style={{ transition: "transform 0.25s", transform: acik ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }} />
            <span style={{ fontFamily: F_DISPLAY, fontSize: 20, fontWeight: 500, color: isElendi ? T.muted : T.text, letterSpacing: "-0.02em", fontVariationSettings: '"opsz" 48' }}>
              {aday.isim}
            </span>
            {isGold && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: F_MONO, fontSize: 9, fontWeight: 600, background: T.goldGrad, color: T.surface, padding: "3px 10px", letterSpacing: "0.14em", textTransform: "uppercase", borderRadius: 3, filter: "drop-shadow(0 1px 4px rgba(212,175,55,0.35))" }}>
                ★ Yıldız
              </span>
            )}
            {isElendi && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: F_MONO, fontSize: 9, fontWeight: 500, border: `1px solid ${T.weakDim}`, color: T.muted, padding: "3px 10px", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 3 }}>
                × Elendi
              </span>
            )}
          </div>
          <div style={{ fontSize: 13.5, color: T.textDim, fontWeight: 400, marginTop: 4 }}>
            {aday.pozisyon}
            {aday.elenSebep && <span style={{ color: T.muted, fontWeight: 400 }}> — {aday.elenSebep}</span>}
          </div>
          <div style={{ fontFamily: F_MONO, fontSize: 10.5, color: T.muted, marginTop: 4, letterSpacing: "0.03em", display: "flex", alignItems: "center", gap: 10 }}>
            <span>{aday.departman}</span>
            <span style={{ color: T.faint }}>·</span>
            <span>{aday.deneyim}</span>
            <span style={{ color: T.faint }}>·</span>
            <span style={{ color: T.faint }}>{sira.sira}/{sira.toplam}</span>
          </div>
        </div>
        <CircularProgress puan={aday.puan} renk={renk} isGold={isGold} />
      </div>

      {!acik && (
        <div onClick={toggle} style={{ position: "relative", padding: "8px 22px 16px 22px" }}>
          <div style={{ fontSize: 12.5, color: T.muted, lineHeight: "19px" }}>{ozetKisa(aday.ozet)}</div>
        </div>
      )}

      {acik && (
        <div style={{ position: "relative" }}>
          <div style={{ padding: "14px 22px 0 22px" }}>
            <div style={{ fontFamily: F_MONO, fontSize: 10, color: T.accent, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8, fontWeight: 500 }}>
              Yönetici Analizi
            </div>
            <div style={{ fontSize: 13, color: T.textDim, lineHeight: "22px" }}>{aday.ozet}</div>
          </div>

          <div style={{ padding: "14px 22px 18px 22px" }}>
            <div style={{ display: "flex", gap: 28, marginTop: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: F_MONO, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 10, fontWeight: 500 }}>İletişim</div>
                <div style={{ fontSize: 12.5, color: T.textDim, lineHeight: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: F_MONO, fontVariantNumeric: "tabular-nums" }}>
                    <Phone size={11} color={T.muted} />
                    <a
                      href={`tel:${(aday.telefon || "").replace(/\s+/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: T.text, textDecoration: "underline", textUnderlineOffset: 2, textDecorationColor: T.borderStrong }}
                    >
                      {aday.telefon}
                    </a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={11} color={T.muted} />
                    <a href={`mailto:${aday.email}`} onClick={(e) => e.stopPropagation()} style={{ color: T.text, textDecoration: "underline", textUnderlineOffset: 2, textDecorationColor: T.borderStrong }}>{aday.email}</a>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: F_MONO, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 10, fontWeight: 500 }}>Yetkinlikler</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(aday.yetkinlikler || []).map((y, i) => (
                    <span key={i} style={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textDim, fontSize: 11, padding: "4px 11px", fontWeight: 500, borderRadius: 999 }}>{y}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 300px" }}>
                <div style={{ fontFamily: F_MONO, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 12, fontWeight: 500 }}>Puan Dağılımı</div>
                {Object.entries(aday.puanDetay).map(([k, v]) => {
                  const y = yuzde(v, MAKS[k]);
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 11.5, color: T.muted, fontWeight: 500, width: 100, flexShrink: 0 }}>{ETIKETLER[k]}</span>
                      <div style={{ flex: 1, height: 5, background: T.borderStrong, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${y}%`, height: "100%", background: barRengi(y), borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontFamily: F_MONO, fontSize: 11, fontWeight: 600, color: barRengi(y), width: 40, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{v}/{MAKS[k]}</span>
                      <span style={{ fontFamily: F_MONO, fontSize: 10, color: T.faint, width: 32, textAlign: "right", flexShrink: 0 }}>%{y}</span>
                    </div>
                  );
                })}
              </div>
              <MiniRadar puanDetay={aday.puanDetay} renk={renk} isGold={isGold} />
            </div>

            {/* Risk flags — soft border pattern */}
            {(() => {
              const flags = riskBayraklari(aday);
              return flags.length > 0 ? (
                <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {flags.map((f, i) => {
                    const color = f.tip === "pozitif" ? T.strong : f.tip === "uyari" ? T.medium : T.weak;
                    const bg = f.tip === "pozitif" ? T.strongDim : f.tip === "uyari" ? T.mediumDim : T.weakDim;
                    return (
                      <span key={i} style={{ fontFamily: F_MONO, fontSize: 10.5, fontWeight: 500, padding: "4px 11px", letterSpacing: "0.04em", border: `1px solid ${bg}`, background: bg, color, borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span>{f.tip === "pozitif" ? "▲" : "⚠"}</span>
                        <span>{f.metin}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null;
            })()}

            {/* Interview questions — FAQ accordion style */}
            {aday.mulakatSorulari && aday.mulakatSorulari.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setSorularAcik(!sorularAcik); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "transparent", border: "none", cursor: "pointer",
                    fontFamily: F_MONO, fontSize: 11, color: T.muted, fontWeight: 500,
                    padding: 0, letterSpacing: "0.04em",
                  }}
                >
                  <ChevronDown size={13} color={T.muted} style={{ transform: sorularAcik ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }} />
                  <MessageSquare size={12} />
                  <span>Mülakat Soruları ({aday.mulakatSorulari.length})</span>
                </button>
                <div style={{
                  maxHeight: sorularAcik ? `${aday.mulakatSorulari.length * 100 + 50}px` : 0,
                  overflow: "hidden",
                  transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
                  opacity: sorularAcik ? 1 : 0,
                }}>
                  <div style={{
                    marginTop: 12, borderLeft: `2px solid ${T.accent}`, paddingLeft: 16,
                    background: "rgba(217,91,0,0.03)", padding: "14px 16px 14px 18px", borderRadius: "0 8px 8px 0",
                  }}>
                    {aday.mulakatSorulari.map((s, i) => (
                      <div key={i} style={{ fontSize: 12.5, color: T.textDim, lineHeight: "21px", marginBottom: i < aday.mulakatSorulari.length - 1 ? 12 : 0 }}>
                        <span style={{ color: T.accent, fontFamily: F_MONO, fontWeight: 600, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <a
                href={aday.cvLink} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="action-btn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: F_BODY, fontSize: 12, fontWeight: 500, color: T.text,
                  textDecoration: "none", padding: "8px 16px",
                  background: T.surfaceRaised, border: `1px solid ${T.border}`,
                  borderRadius: 999, letterSpacing: "0.01em",
                  transition: "all 0.2s ease",
                }}
              >
                <FileText size={12} /> CV Görüntüle
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); karsilastirToggle(aday); }}
                className="action-btn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: F_BODY, fontSize: 12, fontWeight: 500,
                  padding: "8px 16px",
                  background: secili ? "rgba(217,91,0,0.1)" : "transparent",
                  border: `1px solid ${secili ? T.borderAccentStrong : T.border}`,
                  color: secili ? T.accent : T.muted,
                  cursor: "pointer", borderRadius: 999,
                  transition: "all 0.2s ease",
                }}
              >
                <GitCompare size={12} /> {secili ? "Seçildi" : "Karşılaştır"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Table view
function TabloGorunumu({ adaylar }) {
  return (
    <div style={{ overflowX: "auto", fontFamily: F_BODY, borderRadius: 12, border: `1px solid ${T.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: T.surfaceRaised }}>
            {["Aday", "Pozisyon", "Departman", "Den.", "D", "Y", "K", "E", "Puan", "Durum"].map((h) => (
              <th key={h} style={{ padding: "12px 12px", textAlign: "left", fontFamily: F_MONO, fontSize: 10, fontWeight: 500, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {adaylar.map((a) => (
            <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: 12, fontFamily: F_DISPLAY, fontWeight: 500, color: a.durum === "elendi" ? T.muted : T.text, letterSpacing: "-0.015em", fontSize: 13 }}>{a.isim}</td>
              <td style={{ padding: 12, color: T.textDim }}>{a.pozisyon}</td>
              <td style={{ padding: 12, color: T.muted }}>{a.departman}</td>
              <td style={{ padding: 12, color: T.muted, fontFamily: F_MONO, fontVariantNumeric: "tabular-nums" }}>{a.deneyim}</td>
              {Object.entries(a.puanDetay).map(([k, v]) => (
                <td key={k} style={{ padding: 12, fontFamily: F_MONO, fontWeight: 500, color: barRengi(yuzde(v, MAKS[k])), fontVariantNumeric: "tabular-nums" }}>{v}</td>
              ))}
              <td style={{ padding: 12, fontFamily: F_MONO, fontWeight: 500, fontSize: 15, color: puanRengi(a.puan, a.durum), letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", ...metalikPuanStyle(a.durum === "yildiz") }}>{a.puan}</td>
              <td style={{ padding: 12 }}>
                {a.durum === "yildiz" && <span style={{ fontFamily: F_MONO, background: T.goldGrad, color: T.surface, padding: "3px 10px", fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", borderRadius: 3 }}>★ YILDIZ</span>}
                {a.durum === "elendi" && <span style={{ fontFamily: F_MONO, border: `1px solid ${T.weakDim}`, color: T.muted, padding: "3px 10px", fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", borderRadius: 3 }}>× ELENDİ</span>}
                {a.durum === "gecti" && <span style={{ fontFamily: F_MONO, border: `1px solid ${T.strongDim}`, background: T.strongDim, color: T.strong, padding: "3px 10px", fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", borderRadius: 3 }}>✓ GEÇTİ</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function InteraktifRapor() {
  const [adaylarData, setAdaylarData] = useState([]);
  const [haftalikDelta, setHaftalikDelta] = useState(null); // { toplam, yildiz, gecen, elenen, ortPuan } — optional from backend
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [yetkisizGiris, setYetkisizGiris] = useState(false);

  const [arama, setArama] = useState("");
  const [deptFiltre, setDeptFiltre] = useState("Tümü");
  const [durumFiltre, setDurumFiltre] = useState("Tümü");
  const [siralama, setSiralama] = useState("puan");
  const [puanAralik, setPuanAralik] = useState([0, 100]);
  const [acikKartlar, setAcikKartlar] = useState(new Set());
  const [gorunum, setGorunum] = useState("kart");
  const [karsilastirListesi, setKarsilastirListesi] = useState([]);
  const [karsilastirAcik, setKarsilastirAcik] = useState(false);
  const [grafikAcik, setGrafikAcik] = useState(true);
  const [hoveredDept, setHoveredDept] = useState(null);

  useEffect(() => {
    document.body.style.backgroundColor = T.bg;
    const urlParams = new URLSearchParams(window.location.search);
    const raporId = urlParams.get("id");
    
    if (!raporId) { 
      setYetkisizGiris(true); 
      setYukleniyor(false); 
      return; 
    }

    // 🚀 YENİ SUPABASE VERİ ÇEKME MOTORU (EKLENDİ)
    const fetchAdaylar = async () => {
      try {
        const { data, error } = await supabase
          .from('cvera_adaylar')
          .select('*')
          .eq('rapor_id', raporId); // Sadece linkteki ID'ye ait adayları getirir

        if (error) throw error;

        if (data && data.length > 0) {
          const formatli = data.map((row) => {
            // Supabase'den gelen JSON string verisini React objesine çeviriyoruz
            let pd = {};
            try { pd = typeof row.puan_detay === 'string' ? JSON.parse(row.puan_detay) : (row.puan_detay || {}); } catch(e) {}
            
            let yetkinliklerArr = [];
            if (typeof row.temel_yetkinlikler === 'string') {
                yetkinliklerArr = row.temel_yetkinlikler.split(',').map(s => s.trim());
            } else if (Array.isArray(row.temel_yetkinlikler)) {
                yetkinliklerArr = row.temel_yetkinlikler;
            }

            // Vercel'in beklediği isimlere tam eşleştirme (Mapping)
            const guvenliAday = {
              id: row.id,
              isim: row.aday_adi || 'Bilinmeyen Aday',
              pozisyon: row.hedef_pozisyon || '',
              departman: row.departman || 'Belirtilmemiş',
              deneyim: row.toplam_deneyim || '',
              puanDetay: {
                D: Number(pd.sektorel_deneyim || pd.D || 0),
                Y: Number(pd.yetkinlik || pd.Y || 0),
                K: Number(pd.kariyer_istikrari || pd.K || 0),
                E: Number(pd.egitim_uyumu || pd.E || 0)
              },
              puan: Number(row.ai_puani || 0),
              durum: (row.on_eleme || row.cift_kontrol_durumu || '').toLowerCase().includes('elendi') ? 'elendi' : 'gecti',
              ozet: row.yonetici_ozeti || '',
              telefon: row.telefon || row.iletisim_bilgileri?.telefon || '',
              email: row.email || row.iletisim_bilgileri?.email || '',
              yetkinlikler: yetkinliklerArr,
              cvLink: row.cv_linki || '',
              mulakatSorulari: row.mulakat_sorulari || [] // 🚀 Mülakat soruları eklendi
            };

            const isY = isYildiz(guvenliAday);
            guvenliAday.durum = guvenliAday.durum === 'elendi' ? 'elendi' : isY ? 'yildiz' : 'gecti';

            return guvenliAday;
          });
          
          setAdaylarData(formatli);
        } else {
          setAdaylarData([]);
        }
        setYukleniyor(false);
      } catch (err) {
        console.error("Supabase Hatası:", err);
        setHata("Aday verileri sistemden çekilemedi. Lütfen bağlantınızı kontrol edin.");
        setYukleniyor(false);
      }
    };

    fetchAdaylar();
  }, []);

  const departmanlar = ["Tümü", ...new Set(adaylarData.map((a) => a.departman))];
  const durumlar = ["Tümü", "Yıldız Adaylar", "Geçen Adaylar", "Elenen Adaylar"];

  const filtrelenmis = useMemo(() => {
    let s = [...adaylarData];
    if (arama.trim()) {
      const q = arama.toLowerCase();
      s = s.filter((a) => (a.isim || "").toLowerCase().includes(q) || (a.pozisyon || "").toLowerCase().includes(q) || (a.departman || "").toLowerCase().includes(q) || (a.yetkinlikler || []).some((y) => y.toLowerCase().includes(q)));
    }
    if (deptFiltre !== "Tümü") s = s.filter((a) => a.departman === deptFiltre);
    if (durumFiltre === "Yıldız Adaylar") s = s.filter((a) => a.durum === "yildiz");
    else if (durumFiltre === "Geçen Adaylar") s = s.filter((a) => a.durum === "gecti");
    else if (durumFiltre === "Elenen Adaylar") s = s.filter((a) => a.durum === "elendi");
    s = s.filter((a) => a.puan >= puanAralik[0] && a.puan <= puanAralik[1]);
    if (siralama === "puan") { const durumSira = { yildiz: 0, gecti: 1, elendi: 2 }; s.sort((a, b) => durumSira[a.durum] - durumSira[b.durum] || b.puan - a.puan); }
    else if (siralama === "isim") s.sort((a, b) => (a.isim || "").localeCompare(b.isim || "", "tr"));
    else if (siralama === "deneyim") s.sort((a, b) => parseInt(b.deneyim || 0) - parseInt(a.deneyim || 0));
    else if (siralama === "deneyim_puan") s.sort((a, b) => yuzde(b.puanDetay.D, MAKS.D) - yuzde(a.puanDetay.D, MAKS.D));
    else if (siralama === "yetkinlik_puan") s.sort((a, b) => yuzde(b.puanDetay.Y, MAKS.Y) - yuzde(a.puanDetay.Y, MAKS.Y));
    else if (siralama === "kariyer_puan") s.sort((a, b) => yuzde(b.puanDetay.K, MAKS.K) - yuzde(a.puanDetay.K, MAKS.K));
    else if (siralama === "egitim_puan") s.sort((a, b) => yuzde(b.puanDetay.E, MAKS.E) - yuzde(a.puanDetay.E, MAKS.E));
    return s;
  }, [adaylarData, arama, deptFiltre, durumFiltre, siralama, puanAralik]);

  const toplam = adaylarData.length;
  const ortPuan = toplam > 0 ? Math.round(adaylarData.reduce((s, a) => s + a.puan, 0) / toplam) : 0;
  const yildizSayisi = adaylarData.filter((a) => a.durum === "yildiz").length;
  const elenSayisi = adaylarData.filter((a) => a.durum === "elendi").length;
  const gecenSayisi = toplam - yildizSayisi - elenSayisi;

  const deptData = useMemo(() => {
    const c = {}; adaylarData.forEach((a) => { c[a.departman] = (c[a.departman] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ name: n, fullName: n, value: v, fill: DEPT_RENK[n] || "#999" }));
  }, [adaylarData]);

  const puanDagilim = useMemo(() => {
    const b = [
      { aralik: "0–39", min: 0, max: 39, sayi: 0, fill: T.weak },
      { aralik: "40–59", min: 40, max: 59, sayi: 0, fill: T.medium },
      { aralik: "60–79", min: 60, max: 79, sayi: 0, fill: T.strong },
      { aralik: "80–100", min: 80, max: 100, sayi: 0, fill: T.goldSolid },
    ];
    adaylarData.forEach((a) => { const x = b.find((x) => a.puan >= x.min && a.puan <= x.max); if (x) x.sayi++; });
    return b;
  }, [adaylarData]);

  function karsilastirToggle(aday) {
    setKarsilastirListesi((p) => {
      const v = p.find((a) => a.id === aday.id);
      if (v) return p.filter((a) => a.id !== aday.id);
      if (p.length >= 2) return [p[1], aday];
      return [...p, aday];
    });
  }

  // ── GLOBAL STYLE BLOCK ──
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
    
    * { box-sizing: border-box; }
    body { margin: 0; background: ${T.bg}; color: ${T.text}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 0.85; } 50% { opacity: 1; } }
    @keyframes pulseDot { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
    
    /* Magnetic hover — compact version */
    .action-btn:hover {
      border-color: ${T.borderAccentStrong} !important;
      background: rgba(217, 91, 0, 0.08) !important;
      color: ${T.text} !important;
      transform: translateY(-1px);
    }
    
    /* Editorial form inputs */
    .editorial-input {
      font-family: ${F_BODY};
      font-size: 13px;
      background: transparent;
      border: none;
      border-bottom: 1px solid ${T.borderStrong};
      color: ${T.text};
      padding: 10px 0 10px 28px;
      outline: none;
      width: 100%;
      transition: border-color 0.25s ease;
    }
    .editorial-input::placeholder { color: ${T.muted}; }
    .editorial-input:focus { border-bottom-color: ${T.accent}; }
    
    .editorial-select {
      font-family: ${F_MONO};
      font-size: 11px;
      letter-spacing: 0.04em;
      background: transparent;
      border: none;
      border-bottom: 1px solid ${T.borderStrong};
      color: ${T.textDim};
      padding: 10px 28px 10px 0;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23878A80' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 6px center;
      transition: border-color 0.25s ease;
    }
    .editorial-select:focus { border-bottom-color: ${T.accent}; color: ${T.text}; }
    .editorial-select option { background: ${T.surface}; color: ${T.text}; font-family: ${F_BODY}; }
    
    /* Dual-thumb slider */
    .rng { -webkit-appearance: none; appearance: none; background: transparent; pointer-events: none; margin: 0; cursor: pointer; }
    .rng::-webkit-slider-runnable-track { height: 32px; background: transparent; }
    .rng::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px; border-radius: 50%;
      background: ${T.bg}; border: 1.5px solid ${T.accent};
      box-shadow: 0 0 0 3px rgba(217, 91, 0, 0.08);
      margin-top: 8px; pointer-events: auto; cursor: grab;
      transition: transform 0.15s ease;
    }
    .rng::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.15); box-shadow: 0 0 0 6px rgba(217, 91, 0, 0.1); }
    .rng::-moz-range-track { height: 32px; background: transparent; border: none; }
    .rng::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: ${T.bg}; border: 1.5px solid ${T.accent}; pointer-events: auto; cursor: grab; }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${T.borderStrong}; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: ${T.muted}; }
    
    /* Print mode */
    @media print {
      body { background: white !important; color: black !important; }
      .no-print, .filter-bar, .action-btn { display: none !important; }
      .aday-kart { break-inside: avoid; page-break-inside: avoid; background: white !important; color: black !important; border-bottom: 1px solid #ccc !important; }
      .aday-kart * { color: black !important; }
      .dash-tile { background: white !important; border: 1px solid #ccc !important; }
      .dash-tile * { color: black !important; }
    }
  `;

  // ── UNAUTHORIZED STATE ──
  if (yetkisizGiris) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F_BODY, padding: 20, textAlign: "center" }}>
        <style>{globalStyles}</style>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.surfaceRaised, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Lock size={24} color={T.accent} />
        </div>
        <SectionLabel>Erişim Kapalı</SectionLabel>
        <div style={{ fontFamily: F_DISPLAY, fontSize: 32, fontWeight: 500, color: T.text, letterSpacing: "-0.025em", marginTop: 16, marginBottom: 12, fontVariationSettings: '"opsz" 72' }}>
          Bu rapor kilitli<DotAccent />
        </div>
        <div style={{ fontSize: 14, color: T.muted, maxWidth: 420, lineHeight: "1.6" }}>
          Bu raporu görüntülemek için yetkiniz bulunmuyor veya bağlantı süresi dolmuş. Güncel bağlantı için sistem yöneticinize veya Phantom Intelligence ekibine başvurun.
        </div>
      </div>
    );
  }

  // ── LOADING STATE ──
  if (yukleniyor) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F_BODY }}>
        <style>{globalStyles}</style>
        <Loader2 size={32} color={T.accent} style={{ animation: "spin 1s linear infinite", marginBottom: 20 }} />
        <PhantomBreath variant="header" />
        <div style={{ fontSize: 13, color: T.muted, marginTop: 10 }}>Aday verileri analiz ediliyor</div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (hata) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F_BODY, padding: 20 }}>
        <style>{globalStyles}</style>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <SectionLabel>Hata</SectionLabel>
          <div style={{ fontFamily: F_DISPLAY, fontSize: 24, fontWeight: 500, color: T.text, marginTop: 12, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Bağlantı kurulamadı<DotAccent />
          </div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{hata}</div>
        </div>
      </div>
    );
  }

  const raporTarihi = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  // ── MAIN RENDER ──
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", background: T.bg, minHeight: "100vh", fontFamily: F_BODY, color: T.text }}>
      <style>{globalStyles}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ padding: "48px 28px 36px 28px", borderBottom: `1px solid ${T.border}`, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <SectionLabel>Haftalık Rapor</SectionLabel>
            <h1 style={{
              fontFamily: F_DISPLAY,
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 500,
              color: T.text,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: "14px 0 0 0",
              fontVariationSettings: '"opsz" 96',
            }}>
              Aday değerlendirme<DotAccent />
            </h1>
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, fontFamily: F_MONO, fontSize: 12, color: T.muted, letterSpacing: "0.04em" }}>
              <PhantomBreath variant="header" />
              <span style={{ color: T.faint }}>·</span>
              <span>{raporTarihi}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ DASHBOARD TILES ═══ */}
      <section style={{ padding: "32px 28px 0 28px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <DashKart num="01" baslik="Toplam" deger={toplam} ikon={<Users size={15} />} renk={T.muted} alt="bu hafta" delta={haftalikDelta?.toplam} delay={0} />
          <DashKart num="02" baslik="Yıldız" deger={yildizSayisi} ikon={<Star size={15} />} renk={T.goldSolid} alt={toplam > 0 ? `%${Math.round((yildizSayisi / toplam) * 100)} oran` : "-"} delta={haftalikDelta?.yildiz} delay={80} />
          <DashKart num="03" baslik="Geçen" deger={gecenSayisi} ikon={<TrendingUp size={15} />} renk={T.strong} alt={toplam > 0 ? `%${Math.round((gecenSayisi / toplam) * 100)} oran` : "-"} delta={haftalikDelta?.gecen} delay={160} />
          <DashKart num="04" baslik="Elenen" deger={elenSayisi} ikon={<UserX size={15} />} renk={T.weak} alt={toplam > 0 ? `%${Math.round((elenSayisi / toplam) * 100)} oran` : "-"} delta={haftalikDelta?.elenen} delay={240} />
          <DashKart num="05" baslik="Ort. Puan" deger={ortPuan} ikon={<BarChart3 size={15} />} renk={T.accent} alt="/100" delta={haftalikDelta?.ortPuan} delay={320} />
        </div>
      </section>

      {/* ═══ CHARTS — collapsible ═══ */}
      <section className="no-print" style={{ padding: "28px 28px 0 28px" }}>
        <button
          onClick={() => setGrafikAcik(!grafikAcik)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: F_MONO, fontSize: 11, color: T.muted, fontWeight: 500,
            padding: 0, letterSpacing: "0.08em",
          }}
        >
          <BarChart3 size={13} />
          <span>{grafikAcik ? "Grafikleri Gizle" : "Grafikleri Göster"}</span>
          <ChevronDown size={12} style={{ transform: grafikAcik ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }} />
        </button>

        {grafikAcik && (
          <div style={{ display: "flex", gap: 14, marginTop: 16, flexWrap: "wrap", animation: "fadeSlideIn 0.4s ease both" }}>
            {/* Department pie */}
            <div style={{ flex: "1 1 340px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontFamily: F_DISPLAY, fontSize: 16, fontWeight: 500, color: T.text, marginBottom: 4, letterSpacing: "-0.015em" }}>
                Departman Dağılımı
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 16 }}>Hangi departmana kaç başvuru geldi?</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {deptData.map((d) => (
                    <div
                      key={d.fullName}
                      onMouseEnter={() => setHoveredDept(d.fullName)}
                      onMouseLeave={() => setHoveredDept(null)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 11.5, color: hoveredDept === d.fullName ? T.text : T.muted,
                        fontWeight: hoveredDept === d.fullName ? 600 : 400,
                        cursor: "pointer", transition: "all 0.2s",
                        padding: "4px 8px", borderRadius: 6,
                        background: hoveredDept === d.fullName ? T.surfaceRaised : "transparent",
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill, flexShrink: 0 }} />
                      <span>{d.fullName}</span>
                      <span style={{ color: T.faint, fontFamily: F_MONO, fontVariantNumeric: "tabular-nums" }}>— {d.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={deptData} dataKey="value" cx="50%" cy="50%"
                        outerRadius={82} innerRadius={38} paddingAngle={2}
                        stroke="none" label={false}
                        onMouseEnter={(d) => setHoveredDept(d.fullName)}
                        onMouseLeave={() => setHoveredDept(null)}
                      >
                        {deptData.map((d, i) => (
                          <Cell key={i} fill={d.fill} style={{ cursor: "pointer", transform: hoveredDept === d.fullName ? "scale(1.06)" : "scale(1)", transformOrigin: "center", transition: "transform 0.2s ease" }} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Score distribution bar */}
            <div style={{ flex: "1 1 300px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontFamily: F_DISPLAY, fontSize: 16, fontWeight: 500, color: T.text, marginBottom: 4, letterSpacing: "-0.015em" }}>
                Puan Dağılımı
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 16 }}>Adaylar puan aralıklarına göre nasıl dağılıyor?</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={puanDagilim} barCategoryGap="22%">
                  <XAxis dataKey="aralik" tick={{ fontSize: 10, fill: T.muted, fontFamily: F_MONO }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: T.muted, fontFamily: F_MONO }} width={20} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [v + " aday"]} contentStyle={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, fontFamily: F_MONO }} />
                  <Bar dataKey="sayi" radius={[3, 3, 0, 0]}>
                    {puanDagilim.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* ═══ FILTERS — editorial sticky bar ═══ */}
      <section className="filter-bar" style={{ padding: "32px 28px 0 28px" }}>
        <div style={{
          background: T.bg, padding: "20px 22px", borderRadius: 16,
          border: `1px solid ${T.border}`,
          position: "sticky", top: 8, zIndex: 100,
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 240px", position: "relative" }}>
              <Search size={13} color={T.muted} style={{ position: "absolute", left: 2, bottom: 13 }} />
              <input
                className="editorial-input"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="Aday, pozisyon veya yetkinlik ara..."
              />
            </div>
            <select className="editorial-select" value={deptFiltre} onChange={(e) => setDeptFiltre(e.target.value)} style={{ minWidth: 140 }}>
              {departmanlar.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="editorial-select" value={durumFiltre} onChange={(e) => setDurumFiltre(e.target.value)} style={{ minWidth: 120 }}>
              {durumlar.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="editorial-select" value={siralama} onChange={(e) => setSiralama(e.target.value)} style={{ minWidth: 150 }}>
              <option value="puan">Toplam Puan</option>
              <option value="deneyim_puan">Deneyim Puanı</option>
              <option value="yetkinlik_puan">Yetkinlik Puanı</option>
              <option value="kariyer_puan">Kariyer İstikrarı</option>
              <option value="egitim_puan">Eğitim Puanı</option>
              <option value="isim">İsme Göre</option>
            </select>
            <div style={{ display: "flex", background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 999, overflow: "hidden" }}>
              <button onClick={() => setGorunum("kart")} style={{ padding: "8px 12px", background: gorunum === "kart" ? T.accent : "transparent", color: gorunum === "kart" ? T.text : T.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}>
                <LayoutGrid size={13} />
              </button>
              <button onClick={() => setGorunum("tablo")} style={{ padding: "8px 12px", background: gorunum === "tablo" ? T.accent : "transparent", color: gorunum === "tablo" ? T.text : T.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}>
                <Table size={13} />
              </button>
            </div>
          </div>

          {/* Dual-thumb puan slider */}
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: F_MONO, fontSize: 10, color: T.muted, whiteSpace: "nowrap", minWidth: 90, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Puan · <span style={{ color: T.text, fontVariantNumeric: "tabular-nums" }}>{puanAralik[0]}–{puanAralik[1]}</span>
            </span>
            <div style={{ flex: 1, position: "relative", height: 32 }}>
              <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 4, background: T.borderStrong, borderRadius: 2 }} />
              <div style={{ position: "absolute", top: 14, left: `${puanAralik[0]}%`, width: `${puanAralik[1] - puanAralik[0]}%`, height: 4, background: (puanAralik[0] === 0 && puanAralik[1] === 100) ? T.borderStrong : T.accent, borderRadius: 2, transition: "background 0.2s" }} />
              <input type="range" min={0} max={100} value={puanAralik[0]} onChange={(e) => { const v = Math.min(+e.target.value, puanAralik[1] - 1); setPuanAralik([v, puanAralik[1]]); }} className="rng" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: puanAralik[0] > 50 ? 5 : 3 }} />
              <input type="range" min={0} max={100} value={puanAralik[1]} onChange={(e) => { const v = Math.max(+e.target.value, puanAralik[0] + 1); setPuanAralik([puanAralik[0], v]); }} className="rng" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: puanAralik[1] <= 50 ? 5 : 4 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Compare CTA bar */}
      {karsilastirListesi.length === 2 && (
        <div className="no-print" style={{ padding: "14px 28px 0 28px" }}>
          <button
            onClick={() => setKarsilastirAcik(true)}
            className="action-btn"
            style={{
              width: "100%", padding: "14px 20px",
              background: T.accent, color: T.text,
              border: `1px solid ${T.accent}`, borderRadius: 999,
              fontFamily: F_BODY, fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              letterSpacing: "0.01em",
              boxShadow: "0 4px 24px rgba(217, 91, 0, 0.3)",
            }}
          >
            <GitCompare size={15} />
            {karsilastirListesi[0].isim} <span style={{ opacity: 0.6 }}>→</span> {karsilastirListesi[1].isim} karşılaştır
          </button>
        </div>
      )}
      {karsilastirListesi.length === 1 && (
        <div className="no-print" style={{ padding: "10px 28px 0 28px", textAlign: "center" }}>
          <span style={{ fontFamily: F_MONO, fontSize: 11, color: T.muted, letterSpacing: "0.04em" }}>
            <strong style={{ color: T.text, fontWeight: 500 }}>{karsilastirListesi[0].isim}</strong> seçildi · karşılaştırmak için bir aday daha seç
          </span>
        </div>
      )}

      {/* Result count */}
      <div style={{ padding: "20px 28px 8px 28px", fontFamily: F_MONO, fontSize: 11, color: T.muted, letterSpacing: "0.04em" }}>
        <span style={{ color: T.text, fontVariantNumeric: "tabular-nums" }}>{filtrelenmis.length}</span>
        <span> / </span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{toplam}</span>
        <span> aday gösteriliyor</span>
      </div>

      {/* ═══ CANDIDATE LIST ═══ */}
      <section style={{ padding: "0 28px 16px 28px" }}>
        {gorunum === "kart" ? (
          grupla(filtrelenmis).map((g, gi) => {
            const isGoldGrp = g.renk === "yildiz";
            let cardIdx = 0;
            return (
              <div key={gi} style={{ display: "flex", marginBottom: 14, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
                <div style={{ width: 2, flexShrink: 0, background: isGoldGrp ? GOLD_BORDER_GRAD : g.renk, opacity: isGoldGrp ? 1 : 0.5 }} />
                <div style={{ flex: 1, background: T.surface }}>
                  {g.adaylar.map((a, ai) => {
                    const idx = cardIdx++;
                    return (
                      <AdayKart
                        key={a.id}
                        aday={a}
                        acik={acikKartlar.has(a.id)}
                        toggle={() => setAcikKartlar((p) => { const n = new Set(p); n.has(a.id) ? n.delete(a.id) : n.add(a.id); return n; })}
                        karsilastirSecili={!!karsilastirListesi.find((x) => x.id === a.id)}
                        karsilastirToggle={karsilastirToggle}
                        isLast={ai === g.adaylar.length - 1}
                        animDelay={idx * 50}
                        tumAdaylar={adaylarData}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <TabloGorunumu adaylar={filtrelenmis} />
        )}
        {filtrelenmis.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px", color: T.muted, fontSize: 14, fontFamily: F_BODY }}>
            <div style={{ fontFamily: F_DISPLAY, fontSize: 22, fontWeight: 500, color: T.textDim, marginBottom: 8, letterSpacing: "-0.02em" }}>
              Sonuç yok<DotAccent />
            </div>
            <div>Kriterlere uygun aday bulunamadı. Filtreleri genişletip tekrar deneyin.</div>
          </div>
        )}
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "32px 28px 48px 28px", borderTop: `1px solid ${T.border}`, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 16, fontFamily: F_MONO, fontSize: 10, color: T.muted, letterSpacing: "0.04em" }}>
          <span><strong style={{ color: T.accent, fontWeight: 600 }}>D</strong> Deneyim</span>
          <span style={{ color: T.faint }}>·</span>
          <span><strong style={{ color: T.accent, fontWeight: 600 }}>Y</strong> Yetkinlik</span>
          <span style={{ color: T.faint }}>·</span>
          <span><strong style={{ color: T.accent, fontWeight: 600 }}>K</strong> Kariyer İstikrarı</span>
          <span style={{ color: T.faint }}>·</span>
          <span><strong style={{ color: T.accent, fontWeight: 600 }}>E</strong> Eğitim</span>
        </div>
        <div style={{ fontFamily: F_MONO, fontSize: 10, color: T.muted, textAlign: "center", lineHeight: 1.6, letterSpacing: "0.04em", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span>Oluşturma: <span style={{ color: T.textDim, fontVariantNumeric: "tabular-nums" }}>{raporTarihi}</span></span>
          <span style={{ color: T.faint }}>·</span>
          <PhantomBreath variant="footer" />
        </div>
        <div style={{ fontSize: 11, color: T.accent, textAlign: "center", marginTop: 8, opacity: 0.75, fontFamily: F_BODY }}>
          Ön değerlendirme puanları tavsiye niteliğindedir — nihai mülakat kararı İK ekibine aittir.
        </div>
      </footer>

      {karsilastirAcik && karsilastirListesi.length === 2 && (
        <Karsilastir adaylar={karsilastirListesi} kapat={() => setKarsilastirAcik(false)} />
      )}
    </div>
  );
}
