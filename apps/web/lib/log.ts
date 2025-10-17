'use client';
export type LogLevel='DEBUG'|'INFO'|'WARN'|'ERROR';
export type LogEntry={ ts:string; level:LogLevel; msg:string; module?:string; fn?:string; userId?:string; cid?:string; tx?:string; ctx?:any; tags?:string[]; http?:any; req?:any; res?:any };
function iso(){return new Date().toISOString()}
function getCid(){ try{const m=document.cookie.match(/(?:^|; )vt_cid=([^;]+)/); return m?decodeURIComponent(m[1]):undefined;}catch{return undefined;} }
function redactStr(s:string){ s = s.replace(/([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,'$1***$2'); s = s.replace(/\+?\d[\d\s\-]{6,}\d/g,'***redacted***'); s = s.replace(/\b[A-Z]{2}\s?\d{5}\b/g,'REGNR***'); s = s.replace(/\b\d{9,11}\b/g,'KONTO***'); return s; }
function redact(v:any){ if (v==null) return v; if (typeof v==='string') return redactStr(v); if (typeof v==='object'){ const o:any = Array.isArray(v)? [] : {}; for (const k of Object.keys(v)) o[k] = redact(v[k]); return o; } return v; }
const listeners:any[]=[]; const memory:any[]=[]; const MAX=5000; const rank:any={DEBUG:10,INFO:20,WARN:30,ERROR:40};
let globalLevel:'DEBUG'|'INFO'|'WARN'|'ERROR'='INFO'; let moduleLevels:any={}; let activeTx:string|null=null;
function allowed(l:any,m?:string){ const th=m? (moduleLevels[m]||globalLevel):globalLevel; return rank[l]>=rank[th]; }
async function send(e:any){ try{ await fetch('/api/debug/log',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(e),keepalive:true}); }catch{} }
function push(e:any){ memory.push(e); if(memory.length>MAX) memory.shift(); listeners.forEach((f:any)=>f(e)); send(e); }
export const Log={ on:(cb:any)=>{listeners.push(cb); return ()=>{ const i=listeners.indexOf(cb); if(i>=0) listeners.splice(i, 1);} }, all:()=> memory.slice(-MAX),
 setGlobal:(l:any)=>{ globalLevel=l; }, setModuleLevel:(m:string,l:any)=>{ moduleLevels[m]=l; }, getLevels:()=>({ global:globalLevel, modules:{...moduleLevels} }),
 getActiveTx:()=> activeTx, startTx:(name='tx')=>{ activeTx=crypto.randomUUID(); const tx=activeTx; Log.info(`tx:start:${name}`, {name}, {module:name, fn:'tx', tx}); return tx; },
 stopTx:(name='tx')=>{ const tx=activeTx; Log.info(`tx:end:${name}`, {name}, {module:name, fn:'tx', tx}); activeTx=null; },
 log:(level:any,msg:string,ctx?:any, meta?:{module?:string;fn?:string;userId?:string;tx?:string;tags?:string[]})=>{ if(!allowed(level, meta?.module)) return; const e={ ts:iso(), level, msg, module:meta?.module, fn:meta?.fn, userId:meta?.userId, cid:getCid(), tx: meta?.tx || activeTx || undefined, tags: meta?.tags, ctx: ctx? redact(ctx): undefined }; push(e); },
 debug:(m:string,c?:any,meta?:any)=>Log.log('DEBUG',m,c,meta), info:(m:string,c?:any,meta?:any)=>Log.log('INFO',m,c,meta), warn:(m:string,c?:any,meta?:any)=>Log.log('WARN',m,c,meta), error:(m:string,c?:any,meta?:any)=>Log.log('ERROR',m,c,meta),
 toNDJSON:(rows:any[])=> rows.map((r:any)=>JSON.stringify(r)).join('\n'), toCSV:(rows:any[])=>{ const cols=['ts','level','module','fn','msg','cid','tx','userId']; const esc=(v:any)=>{ const s=v==null?'':String(v).replace(/"/g,'""'); return /[",\n]/.test(s)? '"'+s+'"': s; }; return cols.join(',')+'\n'+rows.map((r:any)=> cols.map(k=> esc(r[k])).join(',')).join('\n'); }
};
if(typeof window!=='undefined'){ const L:any=Log; const _l=console.log,_i=console.info,_w=console.warn,_e=console.error;
 console.log=(...a:any[])=>{L.debug(a.map(String).join(' '),{a},{module:'console',fn:'log'}); _l.apply(console,a)};
 console.info=(...a:any[])=>{L.info(a.map(String).join(' '),{a},{module:'console',fn:'info'}); _i.apply(console,a)};
 console.warn=(...a:any[])=>{L.warn(a.map(String).join(' '),{a},{module:'console',fn:'warn'}); _w.apply(console,a)};
 console.error=(...a:any[])=>{L.error(a.map(String).join(' '),{a},{module:'console',fn:'error'}); _e.apply(console,a)};
 window.addEventListener('error',(e:any)=>L.error('window-error',{message:e.message,stack:e.error?.stack},{module:'runtime',fn:'onerror'}));
 window.addEventListener('unhandledrejection',(e:any)=>L.error('unhandled-rejection',{reason:String(e?.reason)},{module:'runtime',fn:'onunhandledrejection'}));
}
export default Log;
