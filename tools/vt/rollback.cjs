#!/usr/bin/env node
const fs=require('fs'), path=require('path');
function copyDir(src,dst){
  fs.mkdirSync(dst,{recursive:true});
  for(const n of fs.readdirSync(src,{withFileTypes:true})){
    const s=path.join(src,n.name), d=path.join(dst,n.name);
    if(n.isDirectory()) copyDir(s,d); else fs.copyFileSync(s,d);
  }
}
const base=process.argv[2]||'releases';
if(!fs.existsSync(base)){ console.error('No releases/'); process.exit(1); }
const snaps=fs.readdirSync(base).filter(n=>n.endsWith('-snapshot')).sort();
if(!snaps.length){ console.error('No snapshots'); process.exit(1); }
const latest=snaps[snaps.length-1];
console.log('> Restoring', latest);
const src=path.join(base, latest);
for(const n of fs.readdirSync('.',{withFileTypes:true})){
  if(['node_modules','.next','.git','releases'].includes(n.name)) continue;
  const p=path.join('.',n.name);
  if(n.isDirectory()) fs.rmSync(p,{recursive:true,force:true}); else fs.unlinkSync(p);
}
copyDir(src, '.');
console.log('> Done.');
