"use client";
import { useMemo, useState } from "react";
import { Activity, ArrowDownUp, ArrowUpRight, BadgeCheck, BarChart3, Bell, ChevronDown, CircleHelp, Coins, Cpu, Eye, Fingerprint, LayoutDashboard, LockKeyhole, Plus, RefreshCw, ScanEye, Settings, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Holding = { symbol: string; name: string; quantity: number; valueUsd: number; color: string };
const initial: Holding[] = [
  { symbol:"ETH", name:"Ethereum", quantity:1.42, valueUsd:4928, color:"#9b8cff" },
  { symbol:"BTC", name:"Bitcoin", quantity:0.042, valueUsd:2780, color:"#e7b65b" },
  { symbol:"NEAR", name:"NEAR Protocol", quantity:820, valueUsd:2460, color:"#72e5d2" },
  { symbol:"USDC", name:"USD Coin", quantity:1800, valueUsd:1800, color:"#669bff" }
];
const trend = [{d:"Mon",v:10820},{d:"Tue",v:11040},{d:"Wed",v:10980},{d:"Thu",v:11420},{d:"Fri",v:11280},{d:"Sat",v:11740},{d:"Sun",v:11968}];
const money = (n:number) => n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
export default function Home() {
  const [holdings,setHoldings] = useState<Holding[]>(initial);
  const [tab,setTab] = useState("Overview");
  const [analysis,setAnalysis] = useState("");
  const [analysisStatus,setAnalysisStatus] = useState("");
  const [busy,setBusy] = useState(false);
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({symbol:"",name:"",quantity:"",valueUsd:""});
  const [wallet,setWallet] = useState("");
  const [quote,setQuote] = useState<any>(null);
  const [quoteStatus,setQuoteStatus] = useState("");
  const total = useMemo(()=>holdings.reduce((s,h)=>s+h.valueUsd,0),[holdings]);
  const nav = [
    {name:"Overview",icon:LayoutDashboard},{name:"Portfolio",icon:Wallet},{name:"AI Analysis",icon:Sparkles},{name:"Swap Assistant",icon:ArrowDownUp},{name:"Activity",icon:Activity},{name:"Settings",icon:Settings}
  ];
  async function runAnalysis(){
    setBusy(true);setAnalysis("");setAnalysisStatus("Sending portfolio for NEAR AI Cloud inference…");
    try{
      const r=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({holdings})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"Analysis failed");
      setAnalysis(d.analysis);setAnalysisStatus(`${d.provider} · ${d.model}. ${d.attestation}`);
      setTab("AI Analysis");
    }catch(e:any){setAnalysisStatus(e.message||"Analysis failed.");}
    finally{setBusy(false);}
  }
  function addHolding(e:React.FormEvent){
    e.preventDefault();const q=Number(form.quantity),v=Number(form.valueUsd);
    if(!form.symbol||!Number.isFinite(q)||!Number.isFinite(v)||q<=0||v<=0)return;
    setHoldings([...holdings,{symbol:form.symbol.toUpperCase(),name:form.name||form.symbol.toUpperCase(),quantity:q,valueUsd:v,color:"#b58cff"}]);
    setForm({symbol:"",name:"",quantity:"",valueUsd:""});setShowAdd(false);
  }
  async function previewQuote(){
    setQuote(null);setQuoteStatus("Requesting a dry-run quote…");
    setQuoteStatus("The 1Click API requires real supported asset IDs, smallest-unit amount, recipient and refund addresses. Select assets and provide wallet addresses in the next integration step.");
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><ScanEye size={17}/></div>private<span style={{color:"#a999ff"}}>portfolio</span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav">{nav.map(({name,icon:Icon})=><button key={name} className={tab===name?"active":""} onClick={()=>setTab(name)}><Icon size={16}/>{name}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="privacy-mini"><span className="dot"/> <strong>Privacy-first by design</strong><p>AI inference is routed to NEAR AI Cloud. Your portfolio is not saved to an application database.</p></div>
        <div style={{padding:"0 10px",fontSize:10,color:"#666d80"}}>PRIVATEPORTFOLIO · BETA</div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="eyebrow">NEAR HACKATHON / PRIVACY × AGENTS</div><div className="top-actions"><div className="network-pill"><span className="dot"/> Demo workspace</div><button className="avatar" title="Profile">S</button></div></header>
      <section className={tab==="Overview"?"section show":"section"}>
        <div className="hero"><div><div className="eyebrow">SUNDAY, NOVEMBER 8, 2026</div><h1>Your portfolio. Your privacy.</h1><p>Understand your holdings with private AI intelligence.</p></div><button className="primary" onClick={runAnalysis} disabled={busy}><Sparkles size={15}/>{busy?"Analyzing…":"Analyze privately"}</button></div>
        <div className="grid stats">
          <div className="card"><div className="stat-label">Total portfolio value <Eye size={14}/></div><div className="stat-value">{money(total)}</div><div className="stat-foot"><span className="positive">●</span> Based on your entered holdings</div></div>
          <div className="card"><div className="stat-label">Assets tracked <Coins size={14}/></div><div className="stat-value">{holdings.length.toString().padStart(2,"0")}</div><div className="stat-foot">Across your portfolio</div></div>
          <div className="card"><div className="stat-label">Largest allocation <BarChart3 size={14}/></div><div className="stat-value">{holdings.length?Math.round(Math.max(...holdings.map(h=>h.valueUsd))/Math.max(total,1)*100):0}%</div><div className="stat-foot">Single-asset concentration</div></div>
          <div className="card"><div className="stat-label">AI privacy layer <ShieldCheck size={14}/></div><div className="stat-value" style={{fontSize:19}}>NEAR AI</div><div className="stat-foot">TEE-backed inference platform</div></div>
        </div>
        <div className="grid middle">
          <div className="card"><div className="card-head"><h2>Portfolio performance</h2><span>Illustrative · 7 days</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9985ff" stopOpacity={.3}/><stop offset="100%" stopColor="#9985ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#272a38" vertical={false}/><XAxis dataKey="d" tick={{fill:"#7d8395",fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#171925",border:"1px solid #34364a",borderRadius:10,color:"#fff"}} formatter={(v:any)=>money(Number(v))}/><Area type="monotone" dataKey="v" stroke="#9b8cff" strokeWidth={2.5} fill="url(#fill)"/></AreaChart></ResponsiveContainer></div></div>
          <div className="card"><div className="card-head"><h2>Asset allocation</h2><span>By entered value</span></div><div className="allocation"><svg className="donut" viewBox="0 0 160 160"><circle cx="80" cy="80" r="57" fill="none" stroke="#272a38" strokeWidth="17"/>{(()=>{let offset=0;return holdings.map((h,i)=>{const pct=total?h.valueUsd/total:0;const len=pct*358;const el=<circle key={h.symbol+i} cx="80" cy="80" r="57" fill="none" stroke={h.color} strokeWidth="17" strokeDasharray={`${len} ${358-len}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)"/>;offset+=len;return el;})})()}<text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="800">{holdings.length}</text><text x="80" y="92" textAnchor="middle" fill="#858b9d" fontSize="9">ASSETS</text></svg><div className="asset-list">{holdings.slice(0,5).map(h=><div className="asset-row" key={h.symbol}><div className="asset-left"><span style={{width:7,height:7,borderRadius:9,background:h.color}}/>{h.symbol}</div><b>{total?Math.round(h.valueUsd/total*100):0}%</b></div>)}</div></div></div>
        </div>
        <div className="grid bottom">
          <div className="card"><div className="card-head"><h2>Your assets</h2><button className="secondary" onClick={()=>setTab("Portfolio")}>Manage portfolio <ArrowUpRight size={13}/></button></div><table className="holding-table"><thead><tr><th>ASSET</th><th>QUANTITY</th><th>VALUE</th></tr></thead><tbody>{holdings.slice(0,4).map(h=><tr key={h.symbol}><td><div className="holding-name"><span className="coin">{h.symbol.slice(0,1)}</span><span><b>{h.name}</b><small>{h.symbol}</small></span></div></td><td>{h.quantity.toLocaleString()}</td><td>{money(h.valueUsd)}</td></tr>)}</tbody></table></div>
          <div className="card action-card"><div><span className="tag"><LockKeyhole size={10}/> PRIVATE AI</span><h3>Clarity without compromise.</h3><p>Get a clearer picture of concentration, exposure, and potential rebalancing considerations. Your analysis is processed through NEAR AI Cloud.</p></div><button className="primary" onClick={runAnalysis} disabled={busy}><Sparkles size={14}/> {busy?"Working…":"Run private analysis"}</button></div>
        </div>
        <div className="notice">Demo workspace: portfolio figures and the performance chart are illustrative sample data, not live wallet balances or market prices. Analysis requires your own NEAR AI Cloud API key.</div>
      </section>
      <section className={tab==="Portfolio"?"section show":"section"}><div className="eyebrow">YOUR DATA</div><h1 className="panel-title">Portfolio</h1><p className="panel-sub">Manage the holdings you want the AI to analyze. These are entered values, not connected wallet balances.</p><div className="card"><div className="card-head"><h2>Holdings</h2><button className="primary" onClick={()=>setShowAdd(true)}><Plus size={14}/> Add asset</button></div><table className="holding-table"><thead><tr><th>ASSET</th><th>QUANTITY</th><th>VALUE (USD)</th><th></th></tr></thead><tbody>{holdings.map(h=><tr key={h.symbol}><td><div className="holding-name"><span className="coin">{h.symbol.slice(0,1)}</span><span><b>{h.name}</b><small>{h.symbol}</small></span></div></td><td>{h.quantity}</td><td>{money(h.valueUsd)}</td><td><button className="secondary" onClick={()=>setHoldings(holdings.filter(x=>x.symbol!==h.symbol))}><X size={12}/> Remove</button></td></tr>)}</tbody></table>{holdings.length===0&&<div className="empty">No holdings yet. Add an asset to get started.</div>}</div>{showAdd&&<div className="card" style={{marginTop:14}}><div className="card-head"><h2>Add a holding</h2><button className="secondary" onClick={()=>setShowAdd(false)}>Cancel</button></div><form className="form-grid" onSubmit={addHolding}><div className="field"><label>Token symbol</label><input required value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value})} placeholder="e.g. SOL"/></div><div className="field"><label>Asset name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Solana"/></div><div className="field"><label>Quantity</label><input required type="number" min="0" step="any" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></div><div className="field"><label>Estimated value (USD)</label><input required type="number" min="0" step="any" value={form.valueUsd} onChange={e=>setForm({...form,valueUsd:e.target.value})}/></div><button className="primary full" type="submit">Save holding</button></form></div>}</section>
      <section className={tab==="AI Analysis"?"section show":"section"}><div className="eyebrow">NEAR AI CLOUD</div><h1 className="panel-title">Private analysis</h1><p className="panel-sub">Portfolio observations generated by NEAR AI Cloud. No financial guarantees or personalized investment instructions.</p><div className="card"><div className="card-head"><h2>Analysis engine</h2><span className="tag"><Cpu size={10}/> TEE inference provider</span></div><p className="panel-sub">Submit your current holdings for analysis. Your Next.js server receives the portfolio before forwarding it to NEAR AI Cloud; this prototype does not implement client-side end-to-end encryption.</p><button className="primary" onClick={runAnalysis} disabled={busy}><Sparkles size={14}/>{busy?"Analyzing…":"Analyze current portfolio"}</button>{analysisStatus&&<div className="notice">{analysisStatus}</div>}{analysis&&<div className="result-box">{analysis}</div>}</div><div className="notice">Verification status: this prototype does not yet independently verify NEAR AI Cloud's hardware attestation or response signature. Do not interpret a successful API response as a verified attestation.</div></section>
      <section className={tab==="Swap Assistant"?"section show":"section"}><div className="eyebrow">NEAR INTENTS · 1CLICK</div><h1 className="panel-title">Swap assistant</h1><p className="panel-sub">Preview cross-chain swap routes with 1Click. This screen is preview-only; it cannot execute a trade.</p><div className="card"><div className="card-head"><h2>Quote preview</h2><span className="tag"><ArrowDownUp size={10}/> DRY RUN ONLY</span></div><div className="notice" style={{marginTop:0}}>To request a real 1Click quote, the API needs supported token asset IDs, an amount in smallest units, and valid recipient and refund addresses. We will complete the token picker and unit conversion after confirming the app runs.</div><div className="field" style={{marginTop:15}}><label>NEAR wallet address (for quote routing)</label><input value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="yourname.near"/></div><button className="primary" style={{marginTop:14}} onClick={previewQuote}><RefreshCw size={14}/> Prepare quote integration</button>{quoteStatus&&<div className="result-box">{quoteStatus}</div>}</div></section>
      <section className={tab==="Activity"?"section show":"section"}><div className="eyebrow">YOUR WORKSPACE</div><h1 className="panel-title">Activity</h1><p className="panel-sub">A local view of recent actions in this browser session.</p><div className="card"><div className="empty">No saved activity yet. Analysis and quote events will appear here as the workflow is completed. This prototype does not persist portfolio data to a database.</div></div></section>
      <section className={tab==="Settings"?"section show":"section"}><div className="eyebrow">PREFERENCES</div><h1 className="panel-title">Settings</h1><p className="panel-sub">Configure your workspace and understand how your data is handled.</p><div className="card"><div className="card-head"><h2>Privacy architecture</h2><ShieldCheck size={16}/></div><p className="panel-sub">Portfolio entries remain in browser state until you request analysis. For analysis, the browser sends the holdings to this app's server route, which forwards them to NEAR AI Cloud using a server-side API key. The server does not save the payload in a database.</p><div className="notice">This is not end-to-end encryption from your browser to the TEE. The application server can process the submitted data. We must be transparent about this limitation in the hackathon demo.</div></div></section>
    </main>
  </div>;
}
