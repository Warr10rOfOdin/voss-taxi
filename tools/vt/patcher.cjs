#!/usr/bin/env node
const fs=require('fs'), path=require('path');
function read(p){ return fs.readFileSync(p,'utf8'); }
function write(p,s){ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,s,'utf8'); }
function exists(p){ try{ fs.accessSync(p); return true; }catch{ return false; } }
function backup(p){ if(!exists(p)) return; const bak=p+'.bak'; if(!exists(bak)) fs.copyFileSync(p,bak); }
function ensureImport(src,imp){ if(src.includes(imp)) return src; const L=src.split(/\r?\n/); let i=0; for(let k=0;k<Math.min(L.length,200);k++){ if(L[k].trim().startsWith('import')) i=k+1; } L.splice(i,0,imp); return L.join('\n'); }
function insertBefore(src,pat,txt){ const i=src.lastIndexOf(pat); if(i<0) return src; return src.slice(0,i)+txt+src.slice(i); }
function replaceBetween(src,a,b,txt,create){ const i=src.indexOf(a); const j=src.indexOf(b,i>=0? i+a.length:0); if(i>=0&&j>=0) return src.slice(0,i+a.length)+'\n'+txt+'\n'+src.slice(j); if(create) return src+'\n'+a+'\n'+txt+'\n'+b+'\n'; return src; }
function textReplace(src,fnd,rep){ return src.includes(fnd)? src.replace(fnd,rep):src; }
function jsonMerge(dst,frag){ let obj=exists(dst)? JSON.parse(read(dst)) : {}; for(const k of Object.keys(frag)){ if(typeof frag[k]==='object'&&!Array.isArray(frag[k])) obj[k]=Object.assign({},obj[k]||{},frag[k]); else obj[k]=frag[k]; } backup(dst); write(dst, JSON.stringify(obj,null,2)); }
function applyEdit(file,e){ let s=exists(file)? read(file):''; const before=s; if(e.op==='ensureImport') s=ensureImport(s,e.import); else if(e.op==='insertBefore') s=insertBefore(s,e.pattern,e.text); else if(e.op==='replaceBetween') s=replaceBetween(s,e.start,e.end,e.text,!!e.createMarkersIfMissing); else if(e.op==='textReplace') s=textReplace(s,e.find,e.replace); if(s!==before){ backup(file); write(file,s); return true; } return false; }
function applyManifest(p,dry){ const dir=path.dirname(p); const mf=JSON.parse(read(p)); console.log('> Patch', mf.id||path.basename(p));
  for(const f of (mf.files||[])){ const dest=f.path; if(f.delete){ if(!dry&&exists(dest)) fs.unlinkSync(dest); console.log('  - delete',dest); continue; }
    const src=f.from? path.join(dir,f.from):null; if(f.writeIfMissing && exists(dest)){ console.log('  - keep (exists)',dest); continue; }
    if(!dry){ backup(dest); if(f.contentBinary){ fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.writeFileSync(dest, fs.readFileSync(src)); } else { const content=f.content ?? (src? fs.readFileSync(src,'utf8') : ''); write(dest, content); } }
    console.log('  - write',dest,(f.contentBinary?'[bin]':''));
  }
  for(const e of (mf.edits||[])){ const ch=!dry && applyEdit(e.file,e); console.log('  -',e.op,e.file,(ch?'[changed]':'')); }
  for(const j of (mf.jsonMerges||[])){ if(!dry) jsonMerge(j.file,j.merge); console.log('  - jsonMerge',j.file); }
  console.log('> Done.');
}
const args=process.argv.slice(2); const dry=args.includes('--dry'); const pats=args.filter(a=>!a.startsWith('--'));
if(!pats.length){ console.log('Usage: node tools/vt/patcher.cjs patches/patch-*.json [--dry]'); process.exit(1); }
for(const p of pats){ if(p.includes('*')){ const dir=require('path').dirname(p); const pref=require('path').basename(p).split('*')[0]; for(const f of require('fs').readdirSync(dir)){ if(f.startsWith(pref)&&f.endsWith('.json')) applyManifest(require('path').join(dir,f),dry); } } else applyManifest(p,dry); }
