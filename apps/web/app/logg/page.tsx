'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Log } from '../../lib/log';
type Row = any;
export default function Logg(){
  const [rows, setRows] = useState<Row[]>([]);
  const [level, setLevel] = useState<'DEBUG'|'INFO'|'WARN'|'ERROR'|'ALL'>('ALL');
  const [q, setQ] = useState('');
  const [cidHL, setCidHL] = useState('');
  const [txHL, setTxHL] = useState('');
  const evRef = useRef<EventSource|null>(null);
  useEffect(()=>{
    const ev = new EventSource('/api/debug/stream');
    evRef.current = ev;
    ev.onmessage = (m)=>{ try{ const d=JSON.parse(m.data); setRows(r=> [...r, d].slice(-5000)); }catch{} };
    return ()=> ev.close();
  },[]);
  useEffect(()=>{ Log.info('viewer:open',{}, {module:'viewer', fn:'open'}); },[]);
  const filtered = useMemo(()=> rows.filter(r=>{
    if (level!=='ALL' && r.level && r.level !== level) return false;
    if (q){ const s=JSON.stringify(r).toLowerCase(); if(!s.includes(q.toLowerCase())) return false; }
    return true;
  }), [rows, level, q]);
  function cls(r:Row){ let c='mono'; if(r.level==='ERROR') c+=' badge'; return c; }
  async function exportNDJSON(){ const t=await (await fetch('/api/debug/log?format=ndjson')).text(); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([t],{type:'application/x-ndjson'})); a.download='log.ndjson'; a.click(); }
  async function exportCSV(){ const t=await (await fetch('/api/debug/log?format=csv')).text(); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'})); a.download='log.csv'; a.click(); }
  function startTx(){ Log.startTx('ui'); }
  return (
    <div className="card">
      <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center'}}>
        <div className="h1">Logg / Feilsøking</div>
        <span className="badge">SSE live</span>
        <button className="btn" onClick={startTx}>Start TX</button>
        <select className="btn" value={level} onChange={e=> setLevel(e.target.value as any)}>
          <option>ALL</option><option>DEBUG</option><option>INFO</option><option>WARN</option><option>ERROR</option>
        </select>
        <input className="btn" placeholder="Søk i logg…" value={q} onChange={e=> setQ(e.target.value)} />
        <input className="btn" placeholder="Highlight cid" value={cidHL} onChange={e=> setCidHL(e.target.value)} />
        <input className="btn" placeholder="Highlight tx" value={txHL} onChange={e=> setTxHL(e.target.value)} />
        <button className="btn" onClick={exportNDJSON}>Export NDJSON</button>
        <button className="btn" onClick={exportCSV}>Export CSV</button>
      </div>
      <div style={{marginTop:12, overflow:'auto', maxHeight:'65vh'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12}}>
          <thead><tr style={{textAlign:'left'}}><th>ts</th><th>lvl</th><th>module</th><th>fn</th><th>msg</th><th>cid</th><th>tx</th><th>userId</th></tr></thead>
          <tbody>
            {filtered.map((r,i)=>{
              const hl = (cidHL && r.cid && String(r.cid).includes(cidHL)) || (txHL && r.tx && String(r.tx).includes(txHL));
              return (
                <tr key={i} style={{borderTop:'1px solid var(--border)', background: hl? 'rgba(255,212,0,.10)':'transparent'}}>
                  <td className={cls(r)}>{r.ts}</td><td>{r.level||''}</td><td>{r.module||''}</td><td>{r.fn||''}</td><td>{r.msg||''}</td><td>{r.cid||''}</td><td>{r.tx||''}</td><td>{r.userId||''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
