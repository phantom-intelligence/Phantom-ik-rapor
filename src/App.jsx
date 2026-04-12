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

// ─── YILDIZ FORMÜL ───
function isYildiz(a){
  if(a.elendi) return false;
  const puanYuzde = (a.puanDetay.Y / MAKS.Y) * 100;
  return a.puan >= 80 && puanYuzde >= 75;
}

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

// ─── UI COMPONENTS ───
function DashKart({ikon,baslik,deger,renk,alt}){
  return(<div style={{flex:"1 1 140px",background:BG,padding:"20px 18px",boxShadow:"0 1px 2px rgba(0,0,0,0.05)",minWidth:130,fontFamily:FONT}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>{ikon}<span style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>{baslik}</span></div>
    <div style={{fontSize:36,fontWeight:500,color:YAZI,lineHeight:1,letterSpacing:-1}}>{deger}</div>
    {alt&&<div style={{fontSize:11,color:"#999",marginTop:6,fontWeight:500}}>{alt}</div>}
  </div>)
}

function AdayKart({aday,acik,toggle,karsilastirSecili,karsilastirToggle,isLast}){
  const renk=puanRengi(aday.puan,aday.durum);
  const isGold=aday.durum==="yildiz";
  const ALTIN_BORDER_GRAD="linear-gradient(180deg, #C9952C 0%, #DFC070 15%, #F5E6A3 35%, #D4AF37 50%, #F5E6A3 65%, #DFC070 85%, #C9952C 100%)";

  return(
  <div style={{display:"flex", marginBottom: 10}}>
    <div style={{width:5, flexShrink:0, background: isGold ? ALTIN_BORDER_GRAD : (aday.durum === "elendi" ? ZAYIF : (aday.puan >= 60 ? GUCLU : ORTA)), borderRadius:"1px"}}/>
    <div style={{flex:1, backgroundColor: karsilastirSecili ? "#1A2030" : BG, borderBottom: isLast ? "none" : "1px solid #1E1E22", transition:"all 0.2s ease", cursor:"pointer", fontFamily:FONT}}>
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
          <div style={{fontSize:12,color:"#AAAAAA",lineHeight:"20px",fontWeight:400}}>{aday.ozet}</div>
        </div>
        <div style={{padding:"10px 18px 16px 18px"}}>
          <div style={{display:"flex",gap:20,marginTop:4,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}><div style={{fontSize:11,color:"#BBBBBB",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:700}}>İletişim</div><div style={{fontSize:12,color:"#BBBBBB",lineHeight:"24px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Phone size={11} color="#bbb"/>{aday.telefon}</div><div style={{display:"flex",alignItems:"center",gap:8}}><Mail size={11} color="#bbb"/><a href={`mailto:${aday.email}`} style={{color:YAZI,textDecoration:"underline"}}>{aday.email}</a></div></div></div>
            <div style={{flex:1,minWidth:180}}><div style={{fontSize:11,color:"#BBBBBB",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:700}}>Yetkinlikler</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{(aday.yetkinlikler||[]).map((y,i)=>(<span key={i} style={{background:"#1E1E22",color:YAZI,fontSize:11,padding:"4px 12px",fontWeight:500}}>{y}</span>))}</div></div>
          </div>
          <div style={{marginTop:16,display:"flex",alignItems:"center",gap:16}}>
            <a href={aday.cvLink} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:500,color:"#999",textDecoration:"none"}}>CV →</a>
            <button onClick={(e)=>{e.stopPropagation(); karsilastirToggle(aday)}} style={{background:"none",color:karsilastirSecili?TURUNCU:"#999",fontSize:11,fontWeight:500,border:"none",cursor:"pointer"}}><GitCompare size={11}/> {karsilastirSecili?"Seçildi":"Karşılaştır"}</button>
          </div>
        </div>
      </div>)}
    </div>
  </div>)
}

// ─── ANA COMPONENT ───
export default function InteraktifRapor(){
  const [adaylarData, setAdaylarData] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  const [arama,setArama]=useState("");const [deptFiltre,setDeptFiltre]=useState("Tümü");const [durumFiltre,setDurumFiltre]=useState("Tümü");const [siralama,setSiralama]=useState("puan");const [puanAralik,setPuanAralik]=useState([0,100]);const [acikKartlar,setAcikKartlar]=useState(new Set());const [gorunum,setGorunum]=useState("kart");const [karsilastirListesi,setKarsilastirListesi]=useState([]);const [grafikAcik,setGrafikAcik]=useState(true);
  const [hoveredDept,setHoveredDept]=useState(null);

  // KRİTİK: BEYAZ KENARLARI SİYAH YAPAN SATIR
  useEffect(() => { document.body.style.backgroundColor = "#0A0A0A"; }, []);

  useEffect(() => {
    const webhookUrl = "https://drkproductions.app.n8n.cloud/webhook/94a212b8-3b87-4326-a765-511364a8fc3a";
    fetch(webhookUrl)
      .then((res) => { if (!res.ok) throw new Error("Ağ hatası"); return res.json(); })
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
        }
        setYukleniyor(false);
      })
      .catch((err) => { setHata("Aday verileri çekilemedi."); setYukleniyor(false); });
  }, []);

  const filtrelenmis=useMemo(()=>{
    let s=[...adaylarData];
    if(arama.trim()){
      const q=arama.toLowerCase();
      s=s.filter(a=>(a.isim||"").toLowerCase().includes(q)||(a.pozisyon||"").toLowerCase().includes(q))
    }
    if(deptFiltre!=="Tümü")s=s.filter(a=>a.departman===deptFiltre);
    if(durumFiltre==="Yıldız Adaylar")s=s.filter(a=>a.durum==="yildiz");
    else if(durumFiltre==="Elenen Adaylar")s=s.filter(a=>a.durum==="elendi");
    s=s.filter(a=>a.puan>=puanAralik[0]&&a.puan<=puanAralik[1]);
    if(siralama==="puan") s.sort((a,b)=>b.puan-a.puan);
    return s;
  },[adaylarData,arama,deptFiltre,durumFiltre,siralama,puanAralik]);

  const toplam=adaylarData.length;
  const ortPuan=toplam>0?Math.round(adaylarData.reduce((s,a)=>s+a.puan,0)/toplam):0;
  const yildizSayisi=adaylarData.filter(a=>a.durum==="yildiz").length;
  const elenSayisi=adaylarData.filter(a=>a.durum==="elendi").length;

  const deptData=useMemo(()=>{
    const c={}; adaylarData.forEach(a=>{c[a.departman]=(c[a.departman]||0)+1});
    return Object.entries(c).map(([n,v])=>({name:n,value:v,fill:DEPT_RENK[n]||"#999"}))
  },[adaylarData]);

  if (yukleniyor) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <Loader2 size={40} color={TURUNCU} style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: BEYAZ }}>Phantom Intelligence</div>
      <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>Veriler analiz ediliyor...</div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const ss={fontSize:12,padding:"8px 12px",border:"1px solid #2A2A2E",background:BG,color:"#BBBBBB",outline:"none",minWidth:100,fontFamily:FONT};
  
  return(<div style={{maxWidth:920,margin:"0 auto",background:BG,minHeight:"100vh",fontFamily:FONT, color: YAZI}}>
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
  
  <div style={{background:SIYAH,padding:"28px 28px 24px", textAlign:"center"}}>
    <div style={{fontSize:10,color:"#666",letterSpacing:4,textTransform:"uppercase",fontWeight:600}}>Phantom Intelligence</div>
    <div style={{fontSize:26,fontWeight:500,color:BEYAZ,marginTop:8,letterSpacing:-.5}}>Haftalık Aday Raporu</div>
    <div style={{height:2,background:`linear-gradient(90deg, transparent, #B34D08, transparent)`,marginTop:20}}/>
  </div>
  
  <div style={{display:"flex",gap:12,padding:"20px 20px 0",flexWrap:"wrap"}}>
    <DashKart ikon={<Users size={18} color="#555"/>} baslik="Toplam" deger={toplam} renk="#555" alt="başvuru"/>
    <DashKart ikon={<Star size={18} color={ALTIN_SOLID}/>} baslik="Yıldız" deger={yildizSayisi} renk={ALTIN_SOLID} alt="üstün yetkinlik"/>
    <DashKart ikon={<UserX size={18} color={ZAYIF}/>} baslik="Elenen" deger={elenSayisi} renk={ZAYIF} alt="uygun değil"/>
    <DashKart ikon={<BarChart3 size={18} color="#777"/>} baslik="Ort. Puan" deger={ortPuan} renk="#777" alt="/100"/>
  </div>

  <div style={{padding:"20px 20px 0"}}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",background:BG,padding:16,border:"1px solid #1E1E22"}}>
      <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Aday ara..." style={{...ss, flex:1}}/>
      <select value={deptFiltre} onChange={e=>setDeptFiltre(e.target.value)} style={ss}>
        <option>Tümü</option>
        {["Mühendislik", "Satış", "Pazarlama", "Bilgi Teknolojileri"].map(d=><option key={d}>{d}</option>)}
      </select>
    </div>
  </div>

  <div style={{padding:"20px"}}>
    {filtrelenmis.map((a,i)=>(
      <AdayKart key={a.id} aday={a} acik={acikKartlar.has(a.id)} toggle={()=>setAcikKartlar(p=>{const n=new Set(p); n.has(a.id)?n.delete(a.id):n.add(a.id); return n})} isLast={i===filtrelenmis.length-1}/>
    ))}
  </div>

  <div style={{background:SIYAH,padding:"24px",textAlign:"center",fontSize:10,color:"#555"}}>
    Phantom Intelligence — AI Destekli İK Analiz Sistemi
  </div>
  </div>)}
