import { useState, useMemo, useEffect } from "react";
import { ChevronDown, BarChart3, LayoutGrid, Table, GitCompare, X, ExternalLink, Phone, Mail, Search, Users, Star, TrendingUp, UserX, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── BRANDING ───
const SIYAH = "#0A0A0A";
const TURUNCU = "#E8620A";
const ALTIN_SOLID = "#D4AF37";
const ALTIN_GRAD = "linear-gradient(135deg, #CFAD58, #EED18D, #B88E33)";
const ALTIN_TEXT_GRAD = "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)";
const GUCLU = "#16A34A";
const ORTA = "#D97706";
const ZAYIF = "#991B1B";
const BEYAZ = "#FFFFFF";
const BG = "#0A0A0A";
const YAZI = "#ECECEC";
const MAKS = { D: 25, Y: 40, K: 20, E: 15 };
const ETIKETLER = { D: "Deneyim", Y: "Yetkinlik", K: "Kariyer İstikrarı", E: "Eğitim" };
const DEPT_RENK = {"Bilgi Teknolojileri":"#2563EB","Finans & Muhasebe":"#059669","Satış":TURUNCU,"Pazarlama":"#7C3AED","Mühendislik":"#0891B2","Müşteri Hizmetleri":"#DC2626","Lojistik & Operasyon":"#475569","İnsan Kaynakları":"#D97706","Üretim & Kalite":"#0D9488","Hukuk":"#6D28D9"};
const FONT = "'Plus Jakarta Sans', sans-serif";

function yuzde(v,m){const r=(v/m)*100;return r-Math.floor(r)>=.5?Math.ceil(r):Math.floor(r)}

function puanRengi(p,d){
  if(d==="yildiz")return ALTIN_SOLID;
  if(d==="elendi")return ZAYIF;
  if(p>=60)return GUCLU;
  if(p>=40)return ORTA;
  return ZAYIF;
}
function barRengi(y){if(y>=70)return GUCLU;if(y>=40)return ORTA;return ZAYIF}

// ─── YILDIZ FORMÜL: puan >= 80 VE yetkinlik %75+ ───
function isYildiz(a){
  if(a.elendi) return false;
  return a.puan >= 80 && (a.puanDetay.Y / MAKS.Y) * 100 >= 75;
}

// ─── BORDER RENK & GRUPLAMA ───
function borderRengi(a){
  if(a.durum==="yildiz") return "yildiz";
  if(a.durum==="elendi") return ZAYIF;
  if(a.puan>=60) return GUCLU;
  return ORTA;
}
function grupla(adaylar){
  const groups=[];let cur=null;
  adaylar.forEach(a=>{const br=borderRengi(a);if(!cur||cur.renk!==br){cur={renk:br,adaylar:[a]};groups.push(cur)}else{cur.adaylar.push(a)}});
  return groups;
}
const ALTIN_BORDER_GRAD="linear-gradient(180deg, #C9952C 0%, #DFC070 15%, #F5E6A3 35%, #D4AF37 50%, #F5E6A3 65%, #DFC070 85%, #C9952C 100%)";

// ─── ÖZET TRUNCATE ───
function ozetKisa(text){
  if(!text) return "";
  const dot = text.indexOf(".");
  if(dot > 0 && dot < 100) return text.substring(0, dot + 1);
  if(text.length > 100) return text.substring(0, 100) + "...";
  return text;
}

// ─── METALİK PUAN STILI ───
function metalikPuanStyle(isGold){
  if(!isGold) return {};
  return {
    background: ALTIN_TEXT_GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };
}

// ─── DASHBOARD KARTI ───
function DashKart({ikon,baslik,deger,renk,alt}){
  return(<div style={{flex:"1 1 140px",background:BG,padding:"20px 18px",boxShadow:"0 1px 2px rgba(0,0,0,0.05)",minWidth:130,fontFamily:FONT}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>{ikon}<span style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>{baslik}</span></div>
    <div style={{fontSize:36,fontWeight:500,color:YAZI,lineHeight:1,letterSpacing:-1}}>{deger}</div>
    {alt&&<div style={{fontSize:11,color:"#999",marginTop:6,fontWeight:500}}>{alt}</div>}
  </div>)
}

// ─── KARŞILAŞTIR MODAL ───
function Karsilastir({adaylar,kapat}){
  const[a,b]=adaylar;const ks=Object.keys(MAKS);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:FONT}} onClick={kapat}>
    <div onClick={e=>e.stopPropagation()} style={{background:BG,maxWidth:700,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
      <div style={{background:SIYAH,color:BEYAZ,padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:15,fontWeight:700,letterSpacing:.3}}>Aday Karşılaştırma</span><X size={18} style={{cursor:"pointer",opacity:.6}} onClick={kapat}/></div>
      <div style={{padding:24}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 70px 1fr",gap:0,textAlign:"center"}}>
          <div style={{padding:14,background:"#1A1A1E",fontWeight:700,fontSize:14,color:YAZI}}>{a.isim}</div>
          <div style={{padding:14,background:"#1E1E22",fontSize:10,color:"#999",fontWeight:700,letterSpacing:1}}>VS</div>
          <div style={{padding:14,background:"#1A1A1E",fontWeight:700,fontSize:14,color:YAZI}}>{b.isim}</div>
          <div style={{padding:12,borderBottom:"1px solid #2A2A2E"}}><span style={{fontSize:32,fontWeight:500,color:puanRengi(a.puan,a.durum),letterSpacing:-1,...metalikPuanStyle(a.durum==="yildiz")}}>{a.puan}</span></div>
          <div style={{padding:12,borderBottom:"1px solid #2A2A2E",fontSize:10,color:"#999",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>PUAN</div>
          <div style={{padding:12,borderBottom:"1px solid #2A2A2E"}}><span style={{fontSize:32,fontWeight:500,color:puanRengi(b.puan,b.durum),letterSpacing:-1,...metalikPuanStyle(b.durum==="yildiz")}}>{b.puan}</span></div>
          {ks.map(k=>{const va=a.puanDetay[k],vb=b.puanDetay[k],ya=yuzde(va,MAKS[k]),yb=yuzde(vb,MAKS[k]),wA=va>vb,wB=vb>va;return[
            <div key={k+"a"} style={{padding:"10px 12px",borderBottom:"1px solid #1E1E22"}}><div style={{fontSize:13,fontWeight:wA?700:400,color:wA?GUCLU:"#666"}}>{va}/{MAKS[k]} <span style={{fontSize:11,color:"#aaa"}}>%{ya}</span></div><div style={{height:4,background:"#2A2A2E",borderRadius:2,marginTop:6}}><div style={{width:`${ya}%`,height:"100%",background:barRengi(ya),borderRadius:2}}/></div></div>,
            <div key={k+"m"} style={{padding:"10px 4px",borderBottom:"1px solid #1E1E22",fontSize:9,color:"#999",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,letterSpacing:.5}}>{ETIKETLER[k].substring(0,3).toUpperCase()}</div>,
            <div key={k+"b"} style={{padding:"10px 12px",borderBottom:"1px solid #1E1E22"}}><div style={{fontSize:13,fontWeight:wB?700:400,color:wB?GUCLU:"#666"}}>{vb}/{MAKS[k]} <span style={{fontSize:11,color:"#aaa"}}>%{yb}</span></div><div style={{height:4,background:"#2A2A2E",borderRadius:2,marginTop:6}}><div style={{width:`${yb}%`,height:"100%",background:barRengi(yb),borderRadius:2}}/></div></div>
          ]})}
        </div>
      </div>
    </div>
  </div>)
}

// ─── ADAY KARTI ───
function AdayKart({aday,acik,toggle,karsilastirSecili,karsilastirToggle,isLast}){
  const renk=puanRengi(aday.puan,aday.durum);const secili=karsilastirSecili;
  const isGold=aday.durum==="yildiz";

  return(<div style={{backgroundColor:secili?"#1A2030":BG,boxShadow:"none",borderBottom:isLast?"none":"1px solid #1E1E22",transition:"all 0.2s ease",cursor:"pointer",fontFamily:FONT}}>
    <div onClick={toggle} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"16px 18px 0 18px"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <ChevronDown size={13} color="#aaa" style={{transition:"transform 0.2s",transform:acik?"rotate(180deg)":"rotate(0)",flexShrink:0}}/>
          <span style={{fontSize:15,fontWeight:700,color:YAZI,letterSpacing:.2}}>{aday.isim}</span>
          {isGold&&<span style={{fontSize:9,fontWeight:700,background:ALTIN_GRAD,color:SIYAH,padding:"2px 10px",letterSpacing:.5,textTransform:"uppercase",filter:"drop-shadow(0 1px 3px rgba(212,175,55,0.5))"}}>★ Yıldız</span>}
          {aday.durum==="elendi"&&<span style={{fontSize:9,fontWeight:700,background:ZAYIF,color:BEYAZ,padding:"2px 10px",letterSpacing:.5,textTransform:"uppercase"}}>✗ Elendi</span>}
        </div>
        <div style={{fontSize:13,color:YAZI,fontWeight:600,marginTop:3,opacity:.7}}>{aday.pozisyon}{aday.elenSebep&&<span style={{color:ZAYIF,fontWeight:600}}> — {aday.elenSebep}</span>}</div>
        <div style={{fontSize:11,color:"#999",marginTop:2,fontWeight:500}}>{aday.departman} · {aday.deneyim}</div>
      </div>
      <div style={{width:72,textAlign:"center",flexShrink:0}}>
        <div style={{fontSize:30,fontWeight:500,color:isGold?undefined:renk,lineHeight:1,letterSpacing:-1,...metalikPuanStyle(isGold)}}>{aday.puan}</div>
        <div style={{width:50,margin:"6px auto",height:3,background:"#2A2A2E",borderRadius:2,overflow:"hidden"}}><div style={{width:`${aday.puan}%`,height:"100%",background:isGold?ALTIN_GRAD:renk,borderRadius:2}}/></div>
        <div style={{fontSize:9,color:"#aaa",lineHeight:"12px",fontWeight:500}}>{Object.entries(aday.puanDetay).map(([k,v])=>`${k}:${yuzde(v,MAKS[k])}`).join(" ")}</div>
      </div>
    </div>
    {!acik && <div onClick={toggle} style={{padding:"6px 18px 12px 18px"}}><div style={{fontSize:12,color:"#888",lineHeight:"18px",fontWeight:400}}>{ozetKisa(aday.ozet)}</div></div>}
    {acik&&(<div>
      <div style={{padding:"12px 18px 0 18px"}}>
        <div style={{fontSize:11,color:"#BBBBBB",textTransform:"uppercase",letterSpacing:1.5,marginBottom:6,fontWeight:700}}>Yönetici Analizi</div>
        <div style={{fontSize:12,color:"#AAAAAA",lineHeight:"20px",fontWeight:400,display:"-webkit-box",WebkitLineClamp:isGold?5:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{aday.ozet}</div>
      </div>
      <div style={{padding:"10px 18px 16px 18px"}}>
        <div style={{display:"flex",gap:20,marginTop:4,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}><div style={{fontSize:11,color:"#BBBBBB",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:700}}>İletişim</div><div style={{fontSize:12,color:"#BBBBBB",lineHeight:"24px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Phone size={11} color="#bbb"/>{aday.telefon}</div><div style={{display:"flex",alignItems:"center",gap:8}}><Mail size={11} color="#bbb"/><a href={`mailto:${aday.email}`} style={{color:YAZI,textDecoration:"underline",textUnderlineOffset:2}}>{aday.email}</a></div></div></div>
          <div style={{flex:1,minWidth:180}}><div style={{fontSize:11,color:"#BBBBBB",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:700}}>Yetkinlikler</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{(aday.yetkinlikler||[]).map((y,i)=>(<span key={i} style={{background:"#1E1E22",color:YAZI,fontSize:11,padding:"4px 12px",fontWeight:500}}>{y}</span>))}</div></div>
        </div>
        <div style={{marginTop:14}}><div style={{fontSize:11,color:"#BBBBBB",textTransform:"uppercase",letterSpacing:1.5,marginBottom:10,fontWeight:700}}>Puan Dağılımı</div><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{Object.entries(aday.puanDetay).map(([k,v])=>{const y=yuzde(v,MAKS[k]);return(<div key={k} style={{flex:1,minWidth:100}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#777",marginBottom:4,fontWeight:500}}><span>{ETIKETLER[k]}</span><span style={{fontWeight:700,color:barRengi(y)}}>%{y}</span></div><div style={{height:5,background:"#2A2A2E",borderRadius:3,overflow:"hidden"}}><div style={{width:`${y}%`,height:"100%",background:barRengi(y),borderRadius:3,transition:"width 0.5s ease"}}/></div></div>)})}</div></div>
        <div style={{marginTop:16,display:"flex",alignItems:"center",gap:16}}>
          <a href={aday.cvLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500,color:"#999",textDecoration:"none",letterSpacing:.3,fontFamily:FONT}}>CV →</a>
          <button onClick={e=>{e.stopPropagation();karsilastirToggle(aday)}} style={{display:"inline-flex",alignItems:"center",gap:5,background:"none",color:secili?TURUNCU:"#999",fontSize:11,fontWeight:500,padding:0,border:"none",cursor:"pointer",letterSpacing:.3,fontFamily:FONT}}><GitCompare size={11}/> {secili?"Seçildi":"Karşılaştır"}</button>
        </div>
      </div>
    </div>)}
  </div>)
}

// ─── TABLO ───
function TabloGorunumu({adaylar}){return(<div style={{overflowX:"auto",fontFamily:FONT}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:SIYAH,color:BEYAZ}}>{["Aday","Pozisyon","Departman","Den.","D","Y","K","E","Puan","Durum"].map(h=>(<th key={h} style={{padding:"11px 10px",textAlign:"left",fontSize:10,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{adaylar.map((a,i)=>(<tr key={a.id} style={{background:i%2===0?BG:"#1A1A1E",borderBottom:"1px solid #1E1E22"}}><td style={{padding:10,fontWeight:600,color:YAZI}}>{a.isim}</td><td style={{padding:10,color:"#AAAAAA"}}>{a.pozisyon}</td><td style={{padding:10,color:"#777"}}>{a.departman}</td><td style={{padding:10,color:"#777"}}>{a.deneyim}</td>{Object.entries(a.puanDetay).map(([k,v])=>(<td key={k} style={{padding:10,fontWeight:600,color:barRengi(yuzde(v,MAKS[k]))}}>{v}</td>))}<td style={{padding:10,fontWeight:500,fontSize:16,color:puanRengi(a.puan,a.durum),letterSpacing:-.5,...metalikPuanStyle(a.durum==="yildiz")}}>{a.puan}</td><td style={{padding:10}}>{a.durum==="yildiz"&&<span style={{background:ALTIN_GRAD,color:SIYAH,padding:"3px 10px",fontSize:9,fontWeight:700,letterSpacing:.5}}>★ YILDIZ</span>}{a.durum==="elendi"&&<span style={{background:ZAYIF,color:BEYAZ,padding:"3px 10px",fontSize:9,fontWeight:700,letterSpacing:.5}}>✗ ELENDİ</span>}{a.durum==="gecti"&&<span style={{background:GUCLU,color:BEYAZ,padding:"3px 10px",fontSize:9,fontWeight:700,letterSpacing:.5}}>✓ GEÇTİ</span>}</td></tr>))}</tbody></table></div>)}

// ─── ANA COMPONENT ───
export default function InteraktifRapor(){
  const [adaylarData, setAdaylarData] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  const[arama,setArama]=useState("");const[deptFiltre,setDeptFiltre]=useState("Tümü");const[durumFiltre,setDurumFiltre]=useState("Tümü");const[siralama,setSiralama]=useState("puan");const[puanAralik,setPuanAralik]=useState([0,100]);const[acikKartlar,setAcikKartlar]=useState(new Set());const[gorunum,setGorunum]=useState("kart");const[karsilastirListesi,setKarsilastirListesi]=useState([]);const[karsilastirAcik,setKarsilastirAcik]=useState(false);const[grafikAcik,setGrafikAcik]=useState(true);
  const[hoveredDept,setHoveredDept]=useState(null);

  // KRİTİK EKLENTİ: SİYAH ARKA PLAN
  useEffect(() => { document.body.style.backgroundColor = "#0A0A0A"; }, []);

  // CANLI VERİ BAĞLANTISI
  useEffect(() => {
    const webhookUrl = "https://drkproductions.app.n8n.cloud/webhook/94a212b8-3b87-4326-a765-511364a8fc3a";
    fetch(webhookUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Ağ hatası");
        return res.json();
      })
      .then((data) => {
        const gelenVeri = Array.isArray(data) ? data : (data.adaylar || []);
        if (gelenVeri.length > 0) {
          const formatli = gelenVeri.map((a) => {
            const pd = a.puanDetay || a.puanYuzde || { D: 0, Y: 0, K: 0, E: 0 };
            const guvenliAday = { ...a, puanDetay: pd };
            const isY = isYildiz(guvenliAday);
            return {
              ...guvenliAday,
              durum: (guvenliAday.durum || "").toLowerCase().includes("elendi") ? "elendi" : isY ? "yildiz" : "gecti",
            };
          });
          setAdaylarData(formatli);
        } else {
          setAdaylarData([]);
        }
        setYukleniyor(false);
      })
      .catch((err) => {
        console.error(err);
        setHata("Aday verileri sistemden çekilemedi. Lütfen bağlantınızı kontrol edin.");
        setYukleniyor(false);
      });
  }, []);

  const departmanlar=["Tümü",...new Set(adaylarData.map(a=>a.departman))];
  const durumlar=["Tümü","Yıldız Adaylar","Geçen Adaylar","Elenen Adaylar"];
  
  const filtrelenmis=useMemo(()=>{
    let s=[...adaylarData];
    if(arama.trim()){
      const q=arama.toLowerCase();
      s=s.filter(a=>(a.isim||"").toLowerCase().includes(q)||(a.pozisyon||"").toLowerCase().includes(q)||(a.departman||"").toLowerCase().includes(q)||(a.yetkinlikler||[]).some(y=>y.toLowerCase().includes(q)))
    }
    if(deptFiltre!=="Tümü")s=s.filter(a=>a.departman===deptFiltre);
    if(durumFiltre==="Yıldız Adaylar")s=s.filter(a=>a.durum==="yildiz");
    else if(durumFiltre==="Geçen Adaylar")s=s.filter(a=>a.durum==="gecti");
    else if(durumFiltre==="Elenen Adaylar")s=s.filter(a=>a.durum==="elendi");
    
    s=s.filter(a=>a.puan>=puanAralik[0]&&a.puan<=puanAralik[1]);
    
    if(siralama==="puan"){
      const durumSira={yildiz:0,gecti:1,elendi:2};
      s.sort((a,b)=>durumSira[a.durum]-durumSira[b.durum]||b.puan-a.puan)
    }
    else if(siralama==="isim")s.sort((a,b)=>(a.isim||"").localeCompare(b.isim||"","tr"));
    else if(siralama==="deneyim")s.sort((a,b)=>parseInt(b.deneyim||0)-parseInt(a.deneyim||0));
    else if(siralama==="deneyim_puan")s.sort((a,b)=>yuzde(b.puanDetay.D,MAKS.D)-yuzde(a.puanDetay.D,MAKS.D));
    else if(siralama==="yetkinlik_puan")s.sort((a,b)=>yuzde(b.puanDetay.Y,MAKS.Y)-yuzde(a.puanDetay.Y,MAKS.Y));
    else if(siralama==="kariyer_puan")s.sort((a,b)=>yuzde(b.puanDetay.K,MAKS.K)-yuzde(a.puanDetay.K,MAKS.K));
    else if(siralama==="egitim_puan")s.sort((a,b)=>yuzde(b.puanDetay.E,MAKS.E)-yuzde(a.puanDetay.E,MAKS.E));
    
    return s;
  },[adaylarData,arama,deptFiltre,durumFiltre,siralama,puanAralik]);
  
  const toplam=adaylarData.length;
  const ortPuan=toplam>0?Math.round(adaylarData.reduce((s,a)=>s+a.puan,0)/toplam):0;
  const yildizSayisi=adaylarData.filter(a=>a.durum==="yildiz").length;
  const elenSayisi=adaylarData.filter(a=>a.durum==="elendi").length;
  
  const deptData=useMemo(()=>{
    const c={};
    adaylarData.forEach(a=>{c[a.departman]=(c[a.departman]||0)+1});
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([n,v])=>({name:n,fullName:n,value:v,fill:DEPT_RENK[n]||"#999"}))
  },[adaylarData]);
  
  const puanDagilim=useMemo(()=>{
    const b=[{aralik:"0–39",min:0,max:39,sayi:0,fill:ZAYIF},{aralik:"40–59",min:40,max:59,sayi:0,fill:ORTA},{aralik:"60–79",min:60,max:79,sayi:0,fill:GUCLU},{aralik:"80–100",min:80,max:100,sayi:0,fill:ALTIN_SOLID}];
    adaylarData.forEach(a=>{const x=b.find(x=>a.puan>=x.min&&a.puan<=x.max);if(x)x.sayi++});
    return b;
  },[adaylarData]);

  function karsilastirToggle(aday){
    setKarsilastirListesi(p=>{const v=p.find(a=>a.id===aday.id);if(v)return p.filter(a=>a.id!==aday.id);if(p.length>=2)return[p[1],aday];return[...p,aday]})
  }

  if (yukleniyor) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'); @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <Loader2 size={40} color={TURUNCU} style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
        <div style={{ fontSize: 18, fontWeight: 600, color: BEYAZ }}>Phantom Intelligence</div>
        <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>En güncel aday verileri analiz ediliyor...</div>
      </div>
    );
  }

  if (hata) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: ZAYIF, fontWeight: 500 }}>
        {hata}
      </div>
    );
  }

  const ss={fontSize:12,padding:"8px 12px",border:"1px solid #2A2A2E",background:BG,color:"#BBBBBB",outline:"none",minWidth:100,fontWeight:500,fontFamily:FONT};
  const CHART_H = 260;
  
  return(<div style={{maxWidth:920,margin:"0 auto",background:BG,minHeight:"100vh",fontFamily:FONT}}>
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
  
  <div style={{background:SIYAH,padding:"28px 28px 24px"}}>
  <div style={{textAlign:"center"}}>
  <div style={{fontSize:10,color:"#666666",letterSpacing:4,textTransform:"uppercase",fontWeight:600}}>Phantom Intelligence</div>
  <div style={{fontSize:26,fontWeight:500,color:BEYAZ,marginTop:8,letterSpacing:-.5}}>Haftalık Aday Raporu</div>
  <div style={{fontSize:12,color:"#777",marginTop:6,fontWeight:400}}>Canlı Veri Bağlantısı Aktif</div>
  </div>
  <div style={{height:2,background:`linear-gradient(90deg, transparent, #B34D08, transparent)`,marginTop:20,borderRadius:1}}/>
  </div>
  
  <div style={{display:"flex",gap:12,padding:"20px 20px 0",flexWrap:"wrap"}}>
  <DashKart ikon={<Users size={18} color="#555"/>} baslik="Toplam" deger={toplam} renk="#555" alt="başvuru bu hafta"/>
  <DashKart ikon={<Star size={18} color={ALTIN_SOLID}/>} baslik="Yıldız" deger={yildizSayisi} renk={ALTIN_SOLID} alt={toplam>0?`%${Math.round(yildizSayisi/toplam*100)} oran`:"%0 oran"}/>
  <DashKart ikon={<TrendingUp size={18} color={GUCLU}/>} baslik="Geçen" deger={toplam-yildizSayisi-elenSayisi} renk={GUCLU} alt={toplam>0?`%${Math.round((toplam-yildizSayisi-elenSayisi)/toplam*100)} oran`:"%0 oran"}/>
  <DashKart ikon={<UserX size={18} color={ZAYIF}/>} baslik="Elenen" deger={elenSayisi} renk={ZAYIF} alt={toplam>0?`%${Math.round(elenSayisi/toplam*100)} oran`:"%0 oran"}/>
  <DashKart ikon={<BarChart3 size={18} color="#777"/>} baslik="Ort. Puan" deger={ortPuan} renk="#777" alt="/100"/>
  </div>
  
  <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"flex-start",alignItems:"center"}}>
  <button onClick={()=>setGrafikAcik(!grafikAcik)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#888",fontWeight:600,padding:0,fontFamily:FONT}}>
  <BarChart3 size={14}/>{grafikAcik?"Grafikleri Gizle":"Grafikleri Göster"}<ChevronDown size={12} style={{transform:grafikAcik?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}/>
  </button></div>
  {grafikAcik&&(<div style={{display:"flex",gap:12,padding:"10px 20px 0",flexWrap:"wrap"}}>
  
  <div style={{flex:"1 1 320px",background:BG,padding:20,boxShadow:"0 1px 2px rgba(0,0,0,0.04)",display:"flex",flexDirection:"column"}}>
  <div style={{fontSize:15,fontWeight:700,color:YAZI,marginBottom:2,letterSpacing:-.3}}>Departman Dağılımı</div>
  <div style={{fontSize:11,color:"#999",marginBottom:14,fontWeight:400}}>Hangi departmana kaç başvuru geldi?</div>
  <div style={{display:"flex",flexDirection:"row",alignItems:"center",gap:16,flex:1}}>
    <div style={{flex:"0 0 auto",display:"flex",flexDirection:"column",gap:6}}>
      {deptData.map(d=>(
        <div key={d.fullName} onMouseEnter={()=>setHoveredDept(d.fullName)} onMouseLeave={()=>setHoveredDept(null)} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:hoveredDept===d.fullName?YAZI:"#777",fontWeight:hoveredDept===d.fullName?700:500,cursor:"pointer",transition:"all 0.15s",padding:"2px 6px",background:hoveredDept===d.fullName?"#1E1E22":"transparent"}}>
          <div style={{width:10,height:10,borderRadius:2,background:d.fill,flexShrink:0}}/>
          <span>{d.fullName}</span>
          <span style={{color:"#bbb",fontWeight:400}}>— {d.value}</span>
        </div>
      ))}
    </div>
    <div style={{flex:1,minWidth:200}}>
      <ResponsiveContainer width="100%" height={CHART_H}>
        <PieChart>
          <Pie data={deptData} dataKey="value" cx="50%" cy="50%" outerRadius={85} innerRadius={35} paddingAngle={2} stroke="none" label={false} onMouseEnter={(d)=>setHoveredDept(d.fullName)} onMouseLeave={()=>setHoveredDept(null)}>
            {deptData.map((d,i)=><Cell key={i} fill={d.fill} style={{cursor:"pointer",transform:hoveredDept===d.fullName?"scale(1.06)":"scale(1)",transformOrigin:"center",transition:"transform 0.2s ease"}}/>)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
  </div>
  
  <div style={{flex:"1 1 280px",background:BG,padding:20,boxShadow:"0 1px 2px rgba(0,0,0,0.04)",display:"flex",flexDirection:"column"}}>
  <div style={{fontSize:15,fontWeight:700,color:YAZI,marginBottom:2,letterSpacing:-.3}}>Puan Dağılımı</div>
  <div style={{fontSize:11,color:"#999",marginBottom:14,fontWeight:400}}>Adaylar puan aralıklarına göre nasıl dağılıyor?</div>
  <div style={{flex:1,display:"flex",alignItems:"flex-end"}}>
  <ResponsiveContainer width="100%" height={CHART_H}>
    <BarChart data={puanDagilim} barCategoryGap="20%">
      <XAxis dataKey="aralik" tick={{fontSize:10,fill:"#999",fontFamily:FONT}} axisLine={false} tickLine={false}/>
      <YAxis allowDecimals={false} tick={{fontSize:10,fill:"#999",fontFamily:FONT}} width={20} axisLine={false} tickLine={false}/>
      <Tooltip formatter={v=>[v+" aday"]}/>
      <Bar dataKey="sayi" radius={[2,2,0,0]}>{puanDagilim.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
    </BarChart>
  </ResponsiveContainer>
  </div>
  </div>
  </div>)}
  
  <div style={{padding:"16px 20px 0"}}>
  <div style={{background:BG,padding:16,boxShadow:"0 1px 2px rgba(0,0,0,0.04)",position:"sticky",top:0,zIndex:100}}>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
  <div style={{flex:"1 1 200px",position:"relative"}}><Search size={14} color="#bbb" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/><input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Aday, pozisyon veya yetkinlik ara..." style={{...ss,width:"100%",paddingLeft:34,boxSizing:"border-box"}}/></div>
  <select value={deptFiltre} onChange={e=>setDeptFiltre(e.target.value)} style={ss}>{departmanlar.map(d=><option key={d}>{d}</option>)}</select>
  <select value={durumFiltre} onChange={e=>setDurumFiltre(e.target.value)} style={ss}>{durumlar.map(d=><option key={d}>{d}</option>)}</select>
  <select value={siralama} onChange={e=>setSiralama(e.target.value)} style={ss}><option value="puan">Toplam Puana Göre</option><option value="deneyim_puan">Deneyim Puanına Göre</option><option value="yetkinlik_puan">Yetkinlik Puanına Göre</option><option value="kariyer_puan">Kariyer İstikrarına Göre</option><option value="egitim_puan">Eğitim Puanına Göre</option><option value="isim">İsme Göre</option></select>
  <div style={{display:"flex",overflow:"hidden",border:"1px solid #2A2A2E"}}><button onClick={()=>setGorunum("kart")} style={{padding:"8px 11px",background:gorunum==="kart"?SIYAH:BG,color:gorunum==="kart"?BEYAZ:"#888",border:"none",cursor:"pointer",display:"flex",alignItems:"center"}}><LayoutGrid size={14}/></button><button onClick={()=>setGorunum("tablo")} style={{padding:"8px 11px",background:gorunum==="tablo"?SIYAH:BG,color:gorunum==="tablo"?BEYAZ:"#888",border:"none",cursor:"pointer",display:"flex",alignItems:"center"}}><Table size={14}/></button></div>
  </div>
  <div style={{marginTop:12,display:"flex",alignItems:"center",gap:12}}>
  <span style={{fontSize:11,color:"#999",whiteSpace:"nowrap",minWidth:80,fontWeight:600}}>Puan: {puanAralik[0]}–{puanAralik[1]}</span>
  <div style={{flex:1,position:"relative",height:32}}>
  <div style={{position:"absolute",top:14,left:0,right:0,height:4,background:"#2A2A2E"}}/>
  <div style={{position:"absolute",top:14,left:`${puanAralik[0]}%`,width:`${puanAralik[1]-puanAralik[0]}%`,height:4,background:(puanAralik[0]===0&&puanAralik[1]===100)?"#2A2A2E":"#B34D08"}}/>
  <input type="range" min={0} max={100} value={puanAralik[0]} onChange={e=>{const v=Math.min(+e.target.value,puanAralik[1]-1);setPuanAralik([v,puanAralik[1]])}} className="rng" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:puanAralik[0]>50?5:3}}/>
  <input type="range" min={0} max={100} value={puanAralik[1]} onChange={e=>{const v=Math.max(+e.target.value,puanAralik[0]+1);setPuanAralik([puanAralik[0],v])}} className="rng" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:puanAralik[1]<=50?5:4}}/>
  <style>{`.rng{-webkit-appearance:none;appearance:none;background:transparent;pointer-events:none;margin:0;cursor:pointer}.rng::-webkit-slider-runnable-track{height:32px;background:transparent}.rng::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#0A0A0A;border:2px solid #555;box-shadow:none;margin-top:7px;pointer-events:auto;cursor:grab}.rng::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.15);border-color:#888}.rng::-moz-range-track{height:32px;background:transparent;border:none}.rng::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#0A0A0A;border:2px solid #555;box-shadow:none;pointer-events:auto;cursor:grab}`}</style>
  </div></div></div></div>
  
  {karsilastirListesi.length===2&&(<div style={{padding:"12px 20px 0"}}><button onClick={()=>setKarsilastirAcik(true)} style={{width:"100%",padding:11,background:TURUNCU,color:BEYAZ,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:.3,fontFamily:FONT}}><GitCompare size={15}/> {karsilastirListesi[0].isim} vs {karsilastirListesi[1].isim} — Karşılaştır</button></div>)}
  {karsilastirListesi.length===1&&(<div style={{padding:"10px 20px 0",textAlign:"center"}}><span style={{fontSize:11,color:"#999"}}>Karşılaştırmak için bir aday daha seçin — <strong style={{color:YAZI}}>{karsilastirListesi[0].isim}</strong> seçildi</span></div>)}
  
  <div style={{padding:"14px 20px 6px",fontSize:11,color:"#999",fontWeight:500}}>{filtrelenmis.length} / {toplam} aday gösteriliyor</div>
  
  <div style={{padding:"0 20px 10px"}}>
  {gorunum==="kart"?grupla(filtrelenmis).map((g,gi)=>{const isGoldGrp=g.renk==="yildiz";return(<div key={gi} style={{display:"flex",marginBottom:10}}><div style={{width:5,flexShrink:0,background:isGoldGrp?ALTIN_BORDER_GRAD:g.renk,borderRadius:"1px"}}/><div style={{flex:1}}>{g.adaylar.map((a,ai)=>(<AdayKart key={a.id} aday={a} acik={acikKartlar.has(a.id)} toggle={()=>setAcikKartlar(p=>{const n=new Set(p);n.has(a.id)?n.delete(a.id):n.add(a.id);return n})} karsilastirSecili={!!karsilastirListesi.find(x=>x.id===a.id)} karsilastirToggle={karsilastirToggle} isLast={ai===g.adaylar.length-1}/>))}</div></div>)}):(<div style={{background:BG,overflow:"hidden",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}><TabloGorunumu adaylar={filtrelenmis}/></div>)}
  {filtrelenmis.length===0&&(<div style={{textAlign:"center",padding:48,color:"#bbb",fontSize:14,fontWeight:500}}>Kriterlere uygun aday bulunamadı.</div>)}
  </div>
  
  <div style={{background:SIYAH,padding:"16px 24px",textAlign:"center"}}>
  <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap",marginBottom:10}}>
    <span style={{fontSize:10,color:"#AAAAAA",fontWeight:500}}><strong style={{color:"#777"}}>D:</strong> Deneyim</span>
    <span style={{fontSize:10,color:"#BBBBBB"}}>·</span>
    <span style={{fontSize:10,color:"#AAAAAA",fontWeight:500}}><strong style={{color:"#777"}}>Y:</strong> Yetkinlik</span>
    <span style={{fontSize:10,color:"#BBBBBB"}}>·</span>
    <span style={{fontSize:10,color:"#AAAAAA",fontWeight:500}}><strong style={{color:"#777"}}>K:</strong> Kariyer İstikrarı</span>
    <span style={{fontSize:10,color:"#BBBBBB"}}>·</span>
    <span style={{fontSize:10,color:"#AAAAAA",fontWeight:500}}><strong style={{color:"#777"}}>E:</strong> Eğitim</span>
  </div>
  <div style={{fontSize:10,color:"#AAAAAA",lineHeight:"17px",fontWeight:400}}>Bu rapor <strong style={{color:"#777"}}>Phantom Intelligence</strong> tarafından otomatik oluşturulmuştur.</div>
  <div style={{fontSize:10,color:"#B34D08",lineHeight:"17px",marginTop:4,fontWeight:500,opacity:.8}}>Ön değerlendirme puanları tavsiye niteliğindedir — nihai mülakat kararı İK ekibine aittir.</div>
  </div>
  
  {karsilastirAcik&&karsilastirListesi.length===2&&<Karsilastir adaylar={karsilastirListesi} kapat={()=>setKarsilastirAcik(false)}/>}
  </div>)}
