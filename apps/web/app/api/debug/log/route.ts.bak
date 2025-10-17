import { NextRequest, NextResponse } from 'next/server';
type Entry = any;
const MAX = 5000;
const buf: Entry[] = [];
const subs = new Set<(e:Entry)=>void>();
function push(e:Entry){ buf.push(e); if (buf.length > MAX) buf.shift(); subs.forEach(f=> f(e)); }
export async function POST(req: NextRequest){
  try{ const body = await req.json(); push(body); return NextResponse.json({ ok:true }); }
  catch(e:any){ return NextResponse.json({ ok:false, error: String(e?.message||e) }, { status:400 }); }
}
export async function GET(req: NextRequest){
  const u = new URL(req.url);
  const fmt = u.searchParams.get('format');
  if (fmt === 'ndjson'){
    const nd = buf.map(e=> JSON.stringify(e)).join('\n');
    return new NextResponse(nd, { headers:{ 'content-type':'application/x-ndjson' } });
  }
  if (fmt === 'csv'){
    const cols = ['ts','level','module','fn','msg','cid','tx','userId'];
    const esc = (v:any)=>{ const s = v==null? '' : String(v).replace(/"/g,'""'); return /[",\n]/.test(s) ? '"'+s+'"' : s; };
    const rows = buf.map((r:any)=> cols.map(k=> esc(r[k])).join(','));
    const csv = cols.join(',') + '\n' + rows.join('\n');
    return new NextResponse(csv, { headers:{ 'content-type':'text/csv' } });
  }
  return NextResponse.json({ items: buf.slice(-1000) });
}
export const __logState = { subs, push, buf };
