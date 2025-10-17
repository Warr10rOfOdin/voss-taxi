'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
type Tab = { label:string; href:string; subtabs?: {label:string; href:string}[] };
const TABS: Tab[] = [
  { label:'Forside', href:'/' },
  { label:'Vakter', href:'/vakter' },
  { label:'Skuleruter i morgon', href:'/skuleruter' },
  { label:'Chat', href:'/chat' },
  { label:'Logg', href:'/logg' },
  { label:'Innstillingar', href:'/instillingar', subtabs:[
    { label:'Admin', href:'/instillingar/admin' },
    { label:'Elevlister', href:'/instillingar/elevlister' },
  ]},
];
export default function TopNav(){
  const path = usePathname();
  const [openIdx, setOpenIdx] = useState<number|null>(null);
  const lockRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    function onDoc(e:MouseEvent){
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as any)){
        setOpenIdx(null);
        lockRef.current = false;
      }
    }
    document.addEventListener('click', onDoc);
    return ()=> document.removeEventListener('click', onDoc);
  },[]);
  function onEnter(i:number){ if (!lockRef.current) setOpenIdx(i); }
  function onLeave(i:number){ if (!lockRef.current) setOpenIdx(null); }
  function onClickTab(i:number, hasSub:boolean){
    if (!hasSub) { setOpenIdx(null); lockRef.current=false; return; }
    if (openIdx===i && lockRef.current){ lockRef.current=false; setOpenIdx(null); return; }
    setOpenIdx(i); lockRef.current=true;
  }
  return (
    <div className="nav zTop" ref={containerRef}>
      <div className="pills">
        {TABS.map((t, i)=>{
          const active = path===t.href || (t.subtabs?.some(s=> path.startsWith(s.href)));
          return (
            <div key={t.href} style={{position:'relative'}} onMouseEnter={()=> onEnter(i)} onMouseLeave={()=> onLeave(i)}>
              <Link href={t.href} onClick={(e)=>{ if(t.subtabs){ e.preventDefault(); onClickTab(i,true);} }}>
                <span className={`pill ${active? 'active':''}`}>{t.label}</span>
              </Link>
              {t.subtabs && openIdx===i && (
                <div className="dropdown">
                  {t.subtabs.map(st=> (
                    <Link key={st.href} href={st.href} onClick={()=> { setOpenIdx(null); lockRef.current=false; }} className="dd-item">{st.label}</Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="right">
          <button className="pill" onClick={()=> alert('Google login kjem seinare')}>Google login</button>
        </div>
      </div>
      {TABS.map(t=> (t.subtabs && (path===t.href || path.startsWith(t.href + '/')))? (
        <div key={t.href} className="subtabs">
          {t.subtabs.map(s=> (
            <Link key={s.href} href={s.href}><span className={`pill ${path===s.href? 'active':''}`}>{s.label}</span></Link>
          ))}
        </div>
      ): null)}
    </div>
  );
}
