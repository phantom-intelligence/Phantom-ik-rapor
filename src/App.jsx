import { useState, useMemo, useEffect } from "react";
import { ChevronDown, BarChart3, LayoutGrid, Table, GitCompare, X, ExternalLink, Phone, Mail, Search, Users, Star, TrendingUp, UserX, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SIYAH = "#0A0A0A";
const TURUNCU = "#E8620A";
const ALTIN = "#A67C00";
const BEYAZ = "#FFFFFF";
const BG = "#F6F5F2";
const MAKS = { D: 25, Y: 40, K: 20, E: 15 };
const ETIKETLER = { D: "Deneyim", Y: "Yetkinlik", K: "Kariyer İstikrarı", E: "Eğitim" };
const DEPT_RENK = {"Bilgi Teknolojileri":"#2563EB","Finans & Muhasebe":"#059669","Satış":TURUNCU,"Pazarlama":"#7C3AED","Mühendislik":"#0891B2","Müşteri Hizmetleri":"#DC2626","Lojistik & Operasyon":"#475569","İnsan Kaynakları":"#D97706","Üretim & Kalite":"#0D9488","Hukuk":"#6D28D9"};

function yuzde(v,m){const r=(v/m)*100;return r-Math.floor(r)>=.5?Math.ceil(r):Math.floor(r)}
function puanRengi(p,d){if(d==="yildiz")return ALTIN;if(d==="elendi")return"#DC2626";if(p>=70)return"#059669";if(p>=50)return"#2563EB";return"#DC2626"}
function barRengi(y){if(y>=70)return"#059669";if(y>=40)return"#2563EB";return"#DC2626"}
function isYildiz(a){return a.puan>=80&&yuzde(a.puanDetay.Y,MAKS.Y)>=75&&!a.elendi}

function DashKart({ikon,baslik,deger,renk,alt}){return(<div style={{flex:"1 1 140px",background:BEYAZ,borderRadius:0,padding:"20px 18px",boxShadow:"0 1px 2px rgba(0,0,0,0.05)",borderLeft:`3px solid ${renk}`,minWidth:130}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>{ikon}<span style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>{baslik}</span></div><div style={{fontSize:36,fontWeight:300,color:SIYAH,lineHeight:1,letterSpacing:-1}}>{deger}</div>{alt&&<div style={{fontSize:11,color:"#999",marginTop:6,fontWeight:500}}>{alt}</div>}</div>)}

function Karsilastir({adaylar,kapat}){const[a,b]=adaylar;const ks=Object.keys(MAKS);return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={kapat}><div onClick={e=>e.stopPropagation()} style={{background:BEYAZ,borderRadius:0,maxWidth:700,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}><div style={{background:SIYAH,color:BEYAZ,padding:"18px 24px",borderRadius:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:15,fontWeight:700,letterSpacing:.3}}>Aday Karşılaştırma</span><X size={18} style={{cursor:"pointer",opacity:.6}} onClick={kapat}/></div><div style={{padding:24}}><div style={{display:"grid",gridTemplateColumns:"1fr 70px 1fr",gap:0,textAlign:"center"}}><div style={{padding:14,background:"#FAFAF8",borderRadius:0,fontWeight:700,fontSize:14,color:SIYAH}}>{a.isim}</div><div style={{padding:14,background:"#F0EFEC",fontSize:10,color:"#999",fontWeight:700,letterSpacing:1}}>VS</div><div style={{padding:14,background:"#FAFAF8",borderRadius:0,fontWeight:700,fontSize:14,color:SIYAH}}>{b.isim}</div><div style={{padding:12,borderBottom:"1px solid #eee"}}><span style={{fontSize:32,fontWeight:300,color:puanRengi(a.puan,a.durum),letterSpacing:-1}}>{a.puan}</span></div><div style={{padding:12,borderBottom:"1px solid #eee",fontSize:10,color:"#999",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>PUAN</div><div style={{padding:12,borderBottom:"1px solid #eee"}}><span style={{fontSize:32,fontWeight:300,color:puanRengi(b.puan,b.durum),letterSpacing:-1}}>{b.puan}</span></div>{ks.map(k=>{const va=a.puanDetay[k],vb=b.puanDetay[k],ya=yuzde(va,MAKS[k]),yb=yuzde(vb,MAKS[k]),wA=va>vb,wB=vb>va;return[<div key={k+"a"} style={{padding:"10px 12px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:13,fontWeight:wA?700:400,color:wA?"#059669":"#666"}}>{va}/{MAKS[k]} <span style={{fontSize:11,color:"#aaa"}}>%{ya}</span></div><div style={{height:4,background:"#eee",borderRadius:2,marginTop:6}}><div style={{width:`${ya}%`,height:"100%",background:barRengi(ya),borderRadius:2}}/></div></div>,<div key={k+"m"} style={{padding:"10px 4px",borderBottom:"1px solid #f0f0f0",fontSize:9,color:"#999",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,letterSpacing:.5}}>{ETIKETLER[k].substring(0,3).toUpperCase()}</div>,<div key={k+"b"} style={{padding:"10px 12px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:13,fontWeight:wB?700:400,color:wB?"#059669":"#666"}}>{vb}/{MAKS[k]} <span style={{fontSize:11,color:"#aaa"}}>%{yb}</span></div><div style={{height:4,background:"#eee",borderRadius:2,marginTop:6}}><div style={{width:`${yb}%`,height:"100%",background:barRengi(yb),borderRadius:2}}/></div></div>]})}</div></div></div></div>)}

function AdayKart({aday,acik,toggle,karsilastirSecili,karsilastirToggle}){const renk=puanRengi(aday.puan,aday.durum);const secili=karsilastirSecili;const bc=aday.durum==="yildiz"?ALTIN:aday.durum==="elendi"?"#DC2626":"#059669";const bg=secili?"#F0F7FF":aday.durum==="yildiz"?"#FDFAF0":aday.durum==="elendi"?"#FEF2F2":BEYAZ;return(<div style={{borderLeft:`3px solid ${bc}`,backgroundColor:bg,borderRadius:0,marginBottom:8,boxShadow:"none",borderBottom:"1px solid #E0DFD8",transition:"all 0.2s ease",cursor:"pointer"}}><div onClick={toggle} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"16px 18px 0 18px"}}><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><ChevronDown size={13} color="#aaa" style={{transition:"transform 0.2s",transform:acik?"rotate(180deg)":"rotate(0)",flexShrink:0}}/><span style={{fontSize:15,fontWeight:700,color:SIYAH,letterSpacing:.2}}>{aday.isim}</span>{aday.durum==="yildiz"&&<span style={{fontSize:9,fontWeight:700,background:ALTIN,color:BEYAZ,padding:"2px 10px",borderRadius:1,letterSpacing:.5,textTransform:"uppercase"}}>★ Yıldız</span>}{aday.durum==="elendi"&&<span style={{fontSize:9,fontWeight:700,background:"#DC2626",color:BEYAZ,padding:"2px 10px",borderRadius:1,letterSpacing:.5,textTransform:"uppercase"}}>✗ Elendi</span>}</div><div style={{fontSize:13,color:SIYAH,fontWeight:600,marginTop:3,opacity:.7}}>{aday.pozisyon}{aday.elenSebep&&<span style={{color:"#DC2626",fontWeight:600}}> — {aday.elenSebep}</span>}</div><div style={{fontSize:11,color:"#999",marginTop:2,fontWeight:500}}>{aday.departman} · {aday.deneyim}</div></div><div style={{width:72,textAlign:"center",flexShrink:0}}><div style={{fontSize:30,fontWeight:300,color:renk,lineHeight:1,letterSpacing:-1}}>{aday.puan}</div><div style={{width:50,margin:"6px auto",height:3,background:"#E8E8E4",borderRadius:2,overflow:"hidden"}}><div style={{width:`${aday.puan}%`,height:"100%",background:renk,borderRadius:2}}/></div><div style={{fontSize:9,color:"#aaa",lineHeight:"12px",fontWeight:500}}>{Object.entries(aday.puanDetay).map(([k,v])=>`${k}:${yuzde(v,MAKS[k])}`).join(" ")}</div></div></div><div onClick={toggle} style={{padding:"8px 18px 12px 18px"}}><div style={{fontSize:12,color:"#666",lineHeight:"19px",fontWeight:400}}>{aday.ozet}</div></div>{acik&&(<div style={{padding:"0 18px 16px 18px",borderTop:"1px solid #E8E8E4"}}><div style={{display:"flex",gap:20,marginTop:14,flexWrap:"wrap"}}><div style={{flex:1,minWidth:180}}><div style={{fontSize:11,color:"#444",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:700}}>İletişim</div><div style={{fontSize:12,color:"#444",lineHeight:"24px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Phone size={11} color="#bbb"/>{aday.telefon}</div><div style={{display:"flex",alignItems:"center",gap:8}}><Mail size={11} color="#bbb"/><a href={`mailto:${aday.email}`} style={{color:SIYAH,textDecoration:"underline",textUnderlineOffset:2}}>{aday.email}</a></div></div></div><div style={{flex:1,minWidth:180}}><div style={{fontSize:11,color:"#444",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:700}}>Yetkinlikler</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{(aday.yetkinlikler||[]).map((y,i)=>(<span key={i} style={{background:"#F0EFEC",color:SIYAH,fontSize:11,padding:"4px 12px",borderRadius:1,fontWeight:500}}>{y}</span>))}</div></div></div><div style={{marginTop:14}}><div style={{fontSize:11,color:"#444",textTransform:"uppercase",letterSpacing:1.5,marginBottom:10,fontWeight:700}}>Puan Dağılımı</div><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{Object.entries(aday.puanDetay).map(([k,v])=>{const y=yuzde(v,MAKS[k]);return(<div key={k} style={{flex:1,minWidth:100}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#777",marginBottom:4,fontWeight:500}}><span>{ETIKETLER[k]}</span><span style={{fontWeight:700,color:barRengi(y)}}>%{y}</span></div><div style={{height:5,background:"#E8E8E4",borderRadius:3,overflow:"hidden"}}><div style={{width:`${y}%`,height:"100%",background:barRengi(y),borderRadius:3,transition:"width 0.5s ease"}}/></div></div>)})}</div></div><div style={{marginTop:16,display:"flex",gap:8}}><a href={aday.cvLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{display:"inline-flex",alignItems:"center",gap:6,background:SIYAH,color:BEYAZ,fontSize:11,fontWeight:600,padding:"9px 20px",textDecoration:"none",borderRadius:0,letterSpacing:.3}}><ExternalLink size={11}/> CV Görüntüle</a><button onClick={e=>{e.stopPropagation();karsilastirToggle(aday)}} style={{display:"inline-flex",alignItems:"center",gap:6,background:secili?TURUNCU:"#F0EFEC",color:secili?BEYAZ:"#666",fontSize:11,fontWeight:600,padding:"9px 20px",border:"none",borderRadius:0,cursor:"pointer",letterSpacing:.3}}><GitCompare size={11}/> {secili?"Seçildi":"Karşılaştır"}</button></div></div>)}</div>)}

function TabloGorunumu({adaylar}){return(<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:SIYAH,color:BEYAZ}}>{["Aday","Pozisyon","Departman","Den.","D","Y","K","E","Puan","Durum"].map(h=>(<th key={h} style={{padding:"11px 10px",textAlign:"left",fontSize:10,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{adaylar.map((a,i)=>(<tr key={a.id} style={{background:i%2===0?BEYAZ:"#FAFAF8",borderBottom:"1px solid #F0EFEC"}}><td style={{padding:10,fontWeight:600,color:SIYAH}}>{a.isim}</td><td style={{padding:10,color:"#555"}}>{a.pozisyon}</td><td style={{padding:10,color:"#777"}}>{a.departman}</td><td style={{padding:10,color:"#777"}}>{a.deneyim}</td>{Object.entries(a.puanDetay).map(([k,v])=>(<td key={k} style={{padding:10,fontWeight:600,color:barRengi(yuzde(v,MAKS[k]))}}>{v}</td>))}<td style={{padding:10,fontWeight:300,fontSize:16,color:puanRengi(a.puan,a.durum),letterSpacing:-.5}}>{a.puan}</td><td style={{padding:10}}>{a.durum==="yildiz"&&<span style={{background:ALTIN,color:BEYAZ,padding:"3px 10px",borderRadius:1,fontSize:9,fontWeight:700,letterSpacing:.5}}>★ YILDIZ</span>}{a.durum==="elendi"&&<span style={{background:"#DC2626",color:BEYAZ,padding:"3px 10px",borderRadius:1,fontSize:9,fontWeight:700,letterSpacing:.5}}>✗ ELENDİ</span>}{a.durum==="gecti"&&<span style={{background:"#059669",color:BEYAZ,padding:"3px 10px",borderRadius:1,fontSize:9,fontWeight:700,letterSpacing:.5}}>✓ GEÇTİ</span>}</td></tr>))}</tbody></table></div>)}

export default function InteraktifRapor() {
  const [adaylar, setAdaylar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

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

  useEffect(() => {
    const n8nWebhookUrl = "https://drkproductions.app.n8n.cloud/webhook/94a212b8-3b87-4326-a765-511364a8fc3a";

    fetch(n8nWebhookUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Ağ hatası");
        return res.json();
      })
      .then((data) => {
        const gelenVeri = Array.isArray(data) ? data : (data.adaylar || []);
        
        if (gelenVeri.length > 0) {
          const formatli = gelenVeri.map((a) => {
            // ÇÖZÜM: n8n'den veri nasıl gelirse gelsin çökmemesi için tam koruma
            const pd = a.puanDetay || a.puanYuzde || { D: 0, Y: 0, K: 0, E: 0 };
            const guvenliAday = { ...a, puanDetay: pd };
            
            return {
              ...guvenliAday,
              durum: (guvenliAday.durum || "").toLowerCase().includes("elendi") ? "elendi" : isYildiz(guvenliAday) ? "yildiz" : "gecti",
            };
          });
          setAdaylar(formatli);
        } else {
          setAdaylar([]);
        }
        setYukleniyor(false);
      })
      .catch((err) => {
        console.error(err);
        setHata("Veriler n8n'den çekilemedi. Lütfen Webhook bağlantınızı kontrol edin.");
        setYukleniyor(false);
      });
  }, []);

  const departmanlar = ["Tümü", ...new Set(adaylar.map((a) => a.departman))];
  const durumlar = ["Tümü", "Yıldız Adaylar", "Geçen Adaylar", "Elenen Adaylar"];
  
  const filtrelenmis = useMemo(() => {
    let s = [...adaylar];
    if (arama.trim()) {
      const q = arama.toLowerCase();
      s = s.filter(a => (a.isim||"").toLowerCase().includes(q) || (a.pozisyon||"").toLowerCase().includes(q) || (a.departman||"").toLowerCase().includes(q) || (a.yetkinlikler||[]).some(y => y.toLowerCase().includes(q)));
    }
    if (deptFiltre !== "Tümü") s = s.filter(a => a.departman === deptFiltre);
    if (durumFiltre === "Yıldız Adaylar") s = s.filter(a => a.durum === "yildiz");
    else if (durumFiltre === "Geçen Adaylar") s = s.filter(a => a.durum === "gecti");
    else if (durumFiltre === "Elenen Adaylar") s = s.filter(a => a.durum === "elendi");
    s = s.filter(a => a.puan >= puanAralik[0] && a.puan <= puanAralik[1]);
    
    if (siralama === "puan") s.sort((a, b) => b.puan - a.puan);
    else if (siralama === "isim") s.sort((a, b) => (a.isim||"").localeCompare(b.isim||"", "tr"));
    else if (siralama === "deneyim") s.sort((a, b) => parseInt(b.deneyim || 0) - parseInt(a.deneyim || 0));
    return s;
  }, [adaylar, arama, deptFiltre, durumFiltre, siralama, puanAralik]);

  const toplam = adaylar.length;
  const ortPuan = toplam > 0 ? Math.round(adaylar.reduce((s, a) => s + a.puan, 0) / toplam) : 0;
  const yildizSayisi = adaylar.filter(a => a.durum === "yildiz").length;
  const elenSayisi = adaylar.filter(a => a.durum === "elendi").length;

  const deptData = useMemo(() => {
    const c = {};
    adaylar.forEach(a => { c[a.departman] = (c[a.departman] || 0) + 1; });
    return Object.entries(c).map(([n, v]) => ({ name: n.length > 15 ? n.substring(0, 15) + "…" : n, fullName: n, value: v, fill: DEPT_RENK[n] || "#999" }));
  }, [adaylar]);

  const puanDagilim = useMemo(() => {
    const b = [
      { aralik: "0–29", min: 0, max: 29, sayi: 0, fill: "#DC2626" },
      { aralik: "30–49", min: 30, max: 49, sayi: 0, fill: "#7C3AED" },
      { aralik: "50–69", min: 50, max: 69, sayi: 0, fill: "#2563EB" },
      { aralik: "70–84", min: 70, max: 84, sayi: 0, fill: "#059669" },
      { aralik: "85–100", min: 85, max: 100, sayi: 0, fill: ALTIN }
    ];
    adaylar.forEach(a => {
      const x = b.find(x => a.puan >= x.min && a.puan <= x.max);
      if (x) x.sayi++;
    });
    return b;
  }, [adaylar]);

  function karsilastirToggle(aday) {
    setKarsilastirListesi(p => {
      const v = p.find(a => a.id === aday.id);
      if (v) return p.filter(a => a.id !== aday.id);
      if (p.length >= 2) return [p[1], aday];
      return [...p, aday];
    });
  }

  if (yukleniyor) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Outfit,sans-serif" }}>
        <Loader2 size={40} color={TURUNCU} style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
        <div style={{ fontSize: 18, fontWeight: 600, color: SIYAH }}>Phantom Intelligence</div>
        <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>En güncel aday verileri n8n'den çekiliyor...</div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (hata) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit,sans-serif", color: "#DC2626", fontWeight: 500 }}>
        {hata}
      </div>
    );
  }

  const ss = { fontSize: 12, padding: "8px 12px", border: "1px solid #E0DFD8", borderRadius: 0, background: BEYAZ, color: "#444", outline: "none", minWidth: 100, fontWeight: 500 };
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", background: BG, minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,700&display=swap');`}</style>

      <div style={{ background: SIYAH, padding: "28px 28px 24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#666", letterSpacing: 4, textTransform: "uppercase", fontFamily: "Outfit,sans-serif", fontWeight: 600 }}>Phantom Intelligence</div>
          <div style={{ fontSize: 26, fontWeight: 300, color: BEYAZ, marginTop: 8, fontFamily: "Fraunces,Georgia,serif", letterSpacing: -.5 }}>Haftalık Aday Raporu</div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 6, fontFamily: "Outfit,sans-serif", fontWeight: 400 }}>Canlı Veri Bağlantısı Aktif</div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${TURUNCU}, transparent)`, marginTop: 20, borderRadius: 1 }} />
      </div>

      <div style={{ display: "flex", gap: 12, padding: "20px 20px 0", flexWrap: "wrap", fontFamily: "Outfit,sans-serif" }}>
        <DashKart ikon={<Users size={18} color="#555" />} baslik="Toplam" deger={toplam} renk="#555" alt="başvuru bu hafta" />
        <DashKart ikon={<Star size={18} color={ALTIN} />} baslik="Yıldız" deger={yildizSayisi} renk={ALTIN} alt={toplam>0?`%${Math.round(yildizSayisi / toplam * 100)} oran`:"%0 oran"} />
        <DashKart ikon={<TrendingUp size={18} color="#059669" />} baslik="Geçen" deger={toplam - yildizSayisi - elenSayisi} renk="#059669" alt={toplam>0?`%${Math.round((toplam - yildizSayisi - elenSayisi) / toplam * 100)} oran`:"%0 oran"} />
        <DashKart ikon={<UserX size={18} color="#DC2626" />} baslik="Elenen" deger={elenSayisi} renk="#DC2626" alt={toplam>0?`%${Math.round(elenSayisi / toplam * 100)} oran`:"%0 oran"} />
      </div>

      <div style={{ padding: "14px 20px 0", fontFamily: "Outfit,sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setGrafikAcik(!grafikAcik)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#888", fontWeight: 600, padding: 0 }}>
          <BarChart3 size={14} />{grafikAcik ? "Grafikleri Gizle" : "Grafikleri Göster"}<ChevronDown size={12} style={{ transform: grafikAcik ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
        </button><span style={{ fontSize: 12, color: "#777", fontWeight: 500 }}>Ortalama Puan: <strong style={{ color: SIYAH, fontSize: 14, fontWeight: 700 }}>{ortPuan}</strong> / 100</span></div>
      
      {grafikAcik && (<div style={{ display: "flex", gap: 12, padding: "10px 20px 0", flexWrap: "wrap", fontFamily: "Outfit,sans-serif" }}>
        <div style={{ flex: "1 1 280px", background: BEYAZ, borderRadius: 0, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: SIYAH, marginBottom: 2, letterSpacing: -.3 }}>Departman Dağılımı</div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 12, fontWeight: 400 }}>Hangi departmana kaç başvuru geldi?</div>
          <ResponsiveContainer width="100%" height={170}><PieChart><Pie data={deptData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={32} paddingAngle={2} stroke="none">{deptData.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie><Tooltip formatter={(v, n, p) => [v + " aday", p.payload.fullName]} /></PieChart></ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 6 }}>{[...deptData].sort((a, b) => b.value - a.value).map(d => (<div key={d.fullName} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#777", fontWeight: 500 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill }} />{d.name} ({d.value})</div>))}</div>
        </div>
        <div style={{ flex: "1 1 280px", background: BEYAZ, borderRadius: 0, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: SIYAH, marginBottom: 2, letterSpacing: -.3 }}>Puan Dağılımı</div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 12, fontWeight: 400 }}>Adaylar puan aralıklarına göre nasıl dağılıyor?</div>
          <ResponsiveContainer width="100%" height={170}><BarChart data={puanDagilim} barCategoryGap="20%"><XAxis dataKey="aralik" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#999" }} width={20} axisLine={false} tickLine={false} /><Tooltip formatter={v => [v + " aday"]} /><Bar dataKey="sayi" radius={[1, 1, 0, 0]}>{puanDagilim.map((d, i) => <Cell key={i} fill={d.fill} />)}</Bar></BarChart></ResponsiveContainer>
        </div></div>)}

      <div style={{ padding: "16px 20px 0", fontFamily: "Outfit,sans-serif" }}>
        <div style={{ background: BEYAZ, borderRadius: 0, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 200px", position: "relative" }}><Search size={14} color="#bbb" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><input value={arama} onChange={e => setArama(e.target.value)} placeholder="Aday, pozisyon veya yetkinlik ara..." style={{ ...ss, width: "100%", paddingLeft: 34, boxSizing: "border-box" }} /></div>
            <select value={deptFiltre} onChange={e => setDeptFiltre(e.target.value)} style={ss}>{departmanlar.map(d => <option key={d}>{d}</option>)}</select>
            <select value={durumFiltre} onChange={e => setDurumFiltre(e.target.value)} style={ss}>{durumlar.map(d => <option key={d}>{d}</option>)}</select>
            <select value={siralama} onChange={e => setSiralama(e.target.value)} style={ss}><option value="puan">Puana Göre</option><option value="isim">İsme Göre</option><option value="deneyim">Deneyime Göre</option></select>
            <div style={{ display: "flex", borderRadius: 0, overflow: "hidden", border: "1px solid #E0DFD8" }}><button onClick={() => setGorunum("kart")} style={{ padding: "8px 11px", background: gorunum === "kart" ? SIYAH : BEYAZ, color: gorunum === "kart" ? BEYAZ : "#888", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}><LayoutGrid size={14} /></button><button onClick={() => setGorunum("tablo")} style={{ padding: "8px 11px", background: gorunum === "tablo" ? SIYAH : BEYAZ, color: gorunum === "tablo" ? BEYAZ : "#888", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}><Table size={14} /></button></div>
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap", minWidth: 80, fontWeight: 600 }}>Puan: {puanAralik[0]}–{puanAralik[1]}</span>
            <div style={{ flex: 1, position: "relative", height: 32 }}>
              <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 4, background: "#E0DFD8" }} />
              <div style={{ position: "absolute", top: 14, left: `${puanAralik[0]}%`, width: `${puanAralik[1] - puanAralik[0]}%`, height: 4, background: SIYAH }} />
              <input type="range" min={0} max={100} value={puanAralik[0]} onChange={e => { const v = Math.min(+e.target.value, puanAralik[1] - 1); setPuanAralik([v, puanAralik[1]]) }} className="rng" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: puanAralik[0] > 50 ? 5 : 3 }} />
              <input type="range" min={0} max={100} value={puanAralik[1]} onChange={e => { const v = Math.max(+e.target.value, puanAralik[0] + 1); setPuanAralik([puanAralik[0], v]) }} className="rng" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: puanAralik[1] <= 50 ? 5 : 4 }} />
              <style>{`
.rng{-webkit-appearance:none;appearance:none;background:transparent;pointer-events:none;margin:0;cursor:pointer}
.rng::-webkit-slider-runnable-track{height:32px;background:transparent}
.rng::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#0A0A0A;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.3);margin-top:5px;pointer-events:auto;cursor:grab}
.rng::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.15)}
.rng::-moz-range-track{height:32px;background:transparent;border:none}
.rng::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#0A0A0A;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.3);pointer-events:auto;cursor:grab}
`}</style>
            </div></div></div></div>

      {karsilastirListesi.length === 2 && (<div style={{ padding: "12px 20px 0", fontFamily: "Outfit,sans-serif" }}><button onClick={() => setKarsilastirAcik(true)} style={{ width: "100%", padding: 11, background: TURUNCU, color: BEYAZ, border: "none", borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: .3 }}><GitCompare size={15} /> {karsilastirListesi[0].isim} vs {karsilastirListesi[1].isim} — Karşılaştır</button></div>)}
      {karsilastirListesi.length === 1 && (<div style={{ padding: "10px 20px 0", textAlign: "center", fontFamily: "Outfit,sans-serif" }}><span style={{ fontSize: 11, color: "#999" }}>Karşılaştırmak için bir aday daha seçin — <strong style={{ color: SIYAH }}>{karsilastirListesi[0].isim}</strong> seçildi</span></div>)}

      <div style={{ padding: "14px 20px 6px", fontSize: 11, color: "#999", fontFamily: "Outfit,sans-serif", fontWeight: 500 }}>{filtrelenmis.length} / {toplam} aday gösteriliyor</div>

      <div style={{ padding: "0 20px 20px", fontFamily: "Outfit,sans-serif" }}>
        {gorunum === "kart" ? filtrelenmis.map(a => (<AdayKart key={a.id} aday={a} acik={acikKartlar.has(a.id)} toggle={() => setAcikKartlar(p => { const n = new Set(p); n.has(a.id) ? n.delete(a.id) : n.add(a.id); return n })} karsilastirSecili={!!karsilastirListesi.find(x => x.id === a.id)} karsilastirToggle={karsilastirToggle} />)) : (<div style={{ background: BEYAZ, borderRadius: 0, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}><TabloGorunumu adaylar={filtrelenmis} /></div>)}
        {filtrelenmis.length === 0 && (<div style={{ textAlign: "center", padding: 48, color: "#bbb", fontSize: 14, fontWeight: 500 }}>Kriterlere uygun aday bulunamadı.</div>)}
      </div>

      <div style={{ background: SIYAH, padding: "20px 24px", textAlign: "center", fontFamily: "Outfit,sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>{Object.entries(ETIKETLER).map(([k, v]) => (<span key={k} style={{ fontSize: 10, color: "#555", fontWeight: 500 }}><strong style={{ color: "#777" }}>{k}:</strong> {v} ({MAKS[k]}p)</span>))}</div>
        <div style={{ fontSize: 10, color: "#555", lineHeight: "17px", fontWeight: 400 }}>Bu rapor <strong style={{ color: "#777" }}>Phantom Intelligence</strong> tarafından otomatik oluşturulmuştur.</div>
        <div style={{ fontSize: 10, color: TURUNCU, lineHeight: "17px", marginTop: 4, fontWeight: 500, opacity: .8 }}>Ön değerlendirme puanları tavsiye niteliğindedir — nihai mülakat kararı İK ekibine aittir.</div>
      </div>

      {karsilastirAcik && karsilastirListesi.length === 2 && <Karsilastir adaylar={karsilastirListesi} kapat={() => setKarsilastirAcik(false)} />}
    </div>)
}